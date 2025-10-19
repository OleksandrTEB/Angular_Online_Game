export interface Player {
  username: string;
  char: string;
  canStep: boolean;
}


export interface Section {
  id: number;
  clicked?: boolean;
  char?: string;
  img?: string;
  canClick?: boolean;
  rendered?: boolean;
}
