using SEM5_PI_WEBAPI.Domain.Shared;

namespace SEM5_PI_WEBAPI.Domain.Qualifications;

public class QualificationService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IQualificationRepository _repo;

    public QualificationService(IUnitOfWork unitOfWork, IQualificationRepository repo)
    {
        _unitOfWork = unitOfWork;
        _repo = repo;
    }

    public async Task<List<QualificationDto>> GetAllAsync()
    {
        var list = await this._repo.GetAllAsync();

        List<QualificationDto> listDto = list.ConvertAll<QualificationDto>(q =>
            new QualificationDto(q.Id.AsGuid(), q.Name, q.Code));

        return listDto;
    }

    public async Task<QualificationDto> GetByIdAsync(QualificationId id)
    {
        var q = await this._repo.GetByIdAsync(id);

        if (q == null)
            return null;

        return new QualificationDto(q.Id.AsGuid(), q.Name, q.Code);
    }

    public async Task<string> GenerateNextQualificationCodeAsync()
    {
        var allCodes = await _repo.GetAllAsync();

        var maxNumber = allCodes.Where(q => !string.IsNullOrEmpty(q.Code) && q.Code.StartsWith("Q-"))
            .Select(q => int.Parse(q.Code.Substring(2)))
            .DefaultIfEmpty(0)
            .Max();

        string nextCode = $"Q-{(maxNumber + 1).ToString("D3")}";
        return nextCode;
    }

    public async Task<Qualification> AddAsync(CreatingQualificationDto dto)
    {
        string code;
        if (dto.Code == null)
        {
            code = await GenerateNextQualificationCodeAsync();
        }
        else
        {
            code = dto.Code;
        }

        var qualification = new Qualification(dto.Name);
        qualification.SetCode(code);
        await _repo.AddAsync(qualification);
        await _unitOfWork.CommitAsync();
        return qualification;
    }
}