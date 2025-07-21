using System.Text.RegularExpressions;

namespace Horizon.Configuration;

public static class ValidationConfig
{
    public static class AgeLimits
    {
        public const int MinAge = 18;
        public const int MaxAge = 120;
    }

    public static class PasswordRequirements
    {
        public const int MinLength = 8;
    }

    public static class ValidationRegex
    {
        public static readonly Regex Email = new(@"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$", RegexOptions.Compiled);
        public static readonly Regex Name = new(@"^[a-zA-Z\s'-]{2,30}$", RegexOptions.Compiled);
        public static readonly Regex Url = new(@"^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$", RegexOptions.Compiled);

        public static readonly Regex HasMixedCase = new(@"(?=.*[a-z])(?=.*[A-Z])", RegexOptions.Compiled);
        public static readonly Regex HasLetterAndNumber = new(@"(?=.*[a-zA-Z])(?=.*\d)", RegexOptions.Compiled);
        public static readonly Regex HasLetterAndSpecial = new(@"(?=.*[a-zA-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':""\\|,.<>\/?])", RegexOptions.Compiled);
    }
}