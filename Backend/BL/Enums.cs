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

    public enum NotificationType
    {
        FriendRequest,
        FriendRequestAccepted,
        ArticleShare,
        CommentLike
    }

    public enum FriendshipStatus
    {
        Pending,
        Accepted,
        Declined
    }
}
