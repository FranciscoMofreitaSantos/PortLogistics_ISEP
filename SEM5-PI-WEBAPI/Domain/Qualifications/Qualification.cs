using SEM5_PI_WEBAPI.Domain.Shared;

namespace SEM5_PI_WEBAPI.Domain.Qualifications;

public class Qualification : Entity<QualificationId>, IAggregateRoot
{
    public string? Code { get; set; }
    public string Name { get; private set; }


    public Qualification(string name)
    {
        Name = name;
    }

    public void ChangeName(string newName)
    {
        if (string.IsNullOrWhiteSpace(newName))
            throw new ArgumentException("Name cannot be empty");
        Name = newName;
    }
    
    public void SetCode(string code)
    {
        if (!System.Text.RegularExpressions.Regex.IsMatch(code, @"^Q-\d{3}$"))
            throw new ArgumentException("Invalid Qualification code format. Expected format: Q-000.");
        Code = code;
    }

    public override bool Equals(object? obj) =>
        obj is Qualification other && Id == other.Id;

    public override int GetHashCode() => Id.GetHashCode();


    public override string ToString() => $"{Code}: {Name}";
}