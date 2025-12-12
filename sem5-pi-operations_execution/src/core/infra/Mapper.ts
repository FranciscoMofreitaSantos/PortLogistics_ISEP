export abstract class Mapper<TDomain, TDTO, TPersistence> {

    abstract toDomain(raw: TPersistence): TDomain | null;

    abstract toDTO(domain: TDomain): TDTO;

    abstract toPersistence(domain: TDomain): TPersistence;
}