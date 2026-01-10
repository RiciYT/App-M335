export interface User {
  uid: string;
  email: string | null;
  isAnonymous?: boolean;
}

export interface GameScore {
  userId: string;
  email: string;
  nickname: string;
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

export interface Wall {
  x: number;
  y: number;
  width: number;
  height: number;
}
