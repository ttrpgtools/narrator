import { type DataConnection, Peer } from 'peerjs';
import { readable, type Readable } from 'svelte/store';

export class Session extends EventTarget {
  public id: Readable<string>;
  private connections: DataConnection[] = [];
  private me: Peer;
  constructor(public gm: boolean = false) {
    super();
    const me = new Peer((null as unknown) as string , {debug: 2});
    this.id = readable<string>('', (set) => {
      me.on('open', (id) => {
        set(id);
      });
    });
    me.on('connection', (dc) => {
      console.log('RECEIVED CONNECTION', dc.metadata);
      this.addConnection(dc);
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
    })
  }

  connect(to: string, name: string) {
    const dc = this.me.connect(to, {
      metadata: {
        name
      },
      serialization: 'json'
    });
    this.addConnection(dc);
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
          name: dc.metadata?.name,
          data
        }
      }))
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
  session.connect(id, name);
  return session;
}
