import { type DataConnection, Peer } from 'peerjs';
import { readable, type Readable } from 'svelte/store';

export class Session extends EventTarget {
  public id: Readable<string>;
  private connections: DataConnection[] = [];
  private pending: [string, string][] = [];
  private me: Peer;
  constructor(public gm: boolean = false) {
    super();
    const me = new Peer((null as unknown) as string , {debug: 3});
    this.id = readable<string>('', (set) => {
      me.on('open', (id) => {
        set(id);
        console.log('I AM', id);
        if (this.pending.length) {
          this.processPending();
        }
      });
    });
    me.on('connection', (dc) => {
      console.log('RECEIVED CONNECTION', dc.metadata);
      this.addConnection(dc);
      this.dispatchEvent(new CustomEvent('status', {
        detail: `New connection from ${dc.metadata.name}`,
      }));
    });
    me.on('error', err => console.error('PEER ERROR', err));
    me.on('close', () => console.log('PEER CLOSED'));
    me.on('disconnected', (cid) => console.log('PEER DISCONNECTED', cid));
    this.me = me;
  }

  send(data: string) {
    console.log('SEND to', this.connections.length, 'connections');
    this.connections.forEach(dc => {
      console.log('SEND TO', dc);
      dc.send(data);
    });
    this.dispatchEvent(new CustomEvent('data', {
      detail: {
        name: this.gm ? 'GM' : this.connections[0]?.metadata?.name,
        data
      }
    }));
  }

  connect(to: string, name: string) {
    console.log('ATTEMPT CONNECTION', to, name);
    if (!this.me.id) {
      this.pending.push([to, name]);
    } else {
      this.makeConn(to, name);
    }
  }

  private makeConn(to: string, name: string) {
    const dc = this.me.connect(to, {
      metadata: {
        name
      },
      reliable: true,
    });
    this.addConnection(dc);
  }

  private processPending() {
    console.log('PROCESSING', this.pending.length);
    this.pending.forEach(([to, name]) => {
      this.makeConn(to, name);
    });
    this.pending = [];
  }

  private addConnection(dc: DataConnection) {
    console.log('ADD CONN', dc);
    dc.on('open', () => {
      console.log('CONNECTION OPEN', dc.metadata);
      this.connections.push(dc);
    });
    dc.on('data', data => {
      console.log('DATA', data);
      this.dispatchEvent(new CustomEvent('data', {
        detail: {
          name: this.gm ? dc.metadata?.name : 'GM',
          data
        }
      }));
    });
    dc.on('error', err => {
      console.error('CONNECTION ERROR', err);
    });
    dc.on('close', () => {
      console.log('CONNECTION CLOSED', dc.metadata);
    })
  }
}

export function hostSession() {
  return new Session(true);
}

export function joinSession(id: string, name: string) {
  const session = new Session();
  //setTimeout(() => {
  //  console.log('DONE WAITING');
    session.connect(id, name);
  //}, 2000);
  return session;
}
