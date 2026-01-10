export interface User {
  uid: string;
  email: string | null;
}

export interface GameScore {
  userId: string;
  email: string;
  time: number;
  timestamp: number;
}

export interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export interface Target {
  x: number;
  y: number;
  radius: number;
}
