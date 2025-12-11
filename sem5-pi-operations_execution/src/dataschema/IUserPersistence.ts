export interface IUserPersistence {
	_id: string;
	name: string;
	email: string;
	auth0UserId: string;
	role: string;
    isActive: boolean;
    isEliminated: boolean;
  }