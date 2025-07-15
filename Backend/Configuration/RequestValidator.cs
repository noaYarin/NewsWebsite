using System.Globalization;
using Horizon.Configuration;
using Horizon.DTOs;

namespace Horizon.Validators;

public static class RequestValidator
{
    public static List<string> ValidateRegistrationRequest(RegisterRequestDto request)
    {
        var errors = new List<string>();

        if (string.IsNullOrEmpty(request.Email) || !ValidationConfig.ValidationRegex.Email.IsMatch(request.Email))
            errors.Add("A valid email is required.");

        if (string.IsNullOrEmpty(request.Password) || request.Password.Length < ValidationConfig.PasswordRequirements.MinLength)
            errors.Add($"Password must be at least {ValidationConfig.PasswordRequirements.MinLength} characters.");
        if (!ValidationConfig.ValidationRegex.HasMixedCase.IsMatch(request.Password))
            errors.Add("Password must include both uppercase and lowercase letters.");
        if (!ValidationConfig.ValidationRegex.HasLetterAndNumber.IsMatch(request.Password) && !ValidationConfig.ValidationRegex.HasLetterAndSpecial.IsMatch(request.Password))
            errors.Add("Password must contain letters with a number or special character.");

        if (string.IsNullOrEmpty(request.FirstName) || !ValidationConfig.ValidationRegex.Name.IsMatch(request.FirstName) ||
            string.IsNullOrEmpty(request.LastName) || !ValidationConfig.ValidationRegex.Name.IsMatch(request.LastName))
            errors.Add("First and last name are required and must be valid.");

        if (string.IsNullOrEmpty(request.BirthDate) || !DateTime.TryParse(request.BirthDate, out DateTime birthDate))
        {
            errors.Add("A valid birthdate is required in YYYY-MM-DD format.");
        }
        else
        {
            var today = DateTime.Today;
            var age = today.Year - birthDate.Year;
            if (birthDate.Date > today.AddYears(-age)) age--;
            if (age < ValidationConfig.AgeLimits.MinAge)
                errors.Add($"You must be at least {ValidationConfig.AgeLimits.MinAge} years old to register.");
        }

        if (request.Tags == null || request.Tags.Count < 3)
            errors.Add("At least 3 interests are required.");

        return errors;
    }

    public static List<string> ValidateProfileUpdateRequest(UpdateProfileRequestDto request)
    {
        var errors = new List<string>();

        if (string.IsNullOrEmpty(request.FirstName) || !ValidationConfig.ValidationRegex.Name.IsMatch(request.FirstName) ||
            string.IsNullOrEmpty(request.LastName) || !ValidationConfig.ValidationRegex.Name.IsMatch(request.LastName))
            errors.Add("First and last name are required and must be valid.");

        if (string.IsNullOrEmpty(request.BirthDate) || !DateTime.TryParse(request.BirthDate, out DateTime birthDate))
        {
            errors.Add("A valid birthdate is required.");
        }
        else
        {
            var today = DateTime.Today;
            var age = today.Year - birthDate.Year;
            if (birthDate.Date > today.AddYears(-age)) age--;
            if (age < ValidationConfig.AgeLimits.MinAge)
                errors.Add($"You must be at least {ValidationConfig.AgeLimits.MinAge} years old.");
        }

        if (!string.IsNullOrEmpty(request.ImageUrl) && !ValidationConfig.ValidationRegex.Url.IsMatch(request.ImageUrl))
            errors.Add("The image URL is not a valid URL.");

        if (!string.IsNullOrEmpty(request.NewPassword))
        {
            if (request.NewPassword.Length < ValidationConfig.PasswordRequirements.MinLength)
                errors.Add($"New password must be at least {ValidationConfig.PasswordRequirements.MinLength} characters.");
            if (!ValidationConfig.ValidationRegex.HasMixedCase.IsMatch(request.NewPassword))
                errors.Add("New password must include both uppercase and lowercase letters.");
            if (!ValidationConfig.ValidationRegex.HasLetterAndNumber.IsMatch(request.NewPassword) && !ValidationConfig.ValidationRegex.HasLetterAndSpecial.IsMatch(request.NewPassword))
                errors.Add("New password must contain letters with a number or special character.");
        }

        if (request.Interests == null || request.Interests.Count < 3)
            errors.Add("At least 3 interests are required.");

        return errors;
    }
}