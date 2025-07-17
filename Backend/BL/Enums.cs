namespace Horizon.BL
{
    public enum ReportReason
    {
        Spam,
        HateSpeech,
        Harassment,
        ViolentSpeech,
        Misinformation,
        Other
    }

    public enum ReportStatus
    {
        Pending,
        Reviewed,
        ActionTaken,
        Dismissed
    }
}