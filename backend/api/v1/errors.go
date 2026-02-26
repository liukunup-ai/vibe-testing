package v1

var (
	Success = newError(0, "ok")

	// common errors
	ErrBadRequest          = newError(400, "Bad Request")
	ErrUnauthorized        = newError(401, "Unauthorized")
	ErrForbidden           = newError(403, "Forbidden")
	ErrNotFound            = newError(404, "Not Found")
	ErrInternalServerError = newError(500, "Internal Server Error")
	ErrServiceUnavailable  = newError(503, "Service Unavailable")

	// system errors
	ErrEmptyToken              = newError(1001, "token is empty")
	ErrInvalidToken            = newError(1002, "invalid token")
	ErrUnexpectedClaim         = newError(1003, "unexpected claims type")
	ErrTokenExpired            = newError(1004, "token has expired")
	ErrInvalidSigningMethod    = newError(1005, "invalid signing method")
	ErrInvalidKeyLength        = newError(1006, "invalid key length")
	ErrRedisUnavailable        = newError(1007, "redis service unavailable")
	ErrUnexpectedSigningMethod = newError(1008, "unexpected signing method")
	ErrInvalidAccessToken      = newError(1009, "invalid access token")
	ErrInvalidRefreshToken     = newError(1010, "invalid refresh token")
	ErrTokenAlreadyRevoked     = newError(1011, "token already revoked with later expiry")

	// feature errors
	ErrSMTPNotConfigured  = newError(2001, "SMTP is not configured. Please contact administrator to configure email settings.")
	ErrLDAPNotConfigured  = newError(2002, "LDAP is not configured. Please contact administrator to enable LDAP login.")
	ErrOIDCNotConfigured  = newError(2003, "OIDC is not configured. Please contact administrator to enable SSO login.")
	ErrRedisNotConfigured = newError(2004, "Redis is not configured.")
	ErrS3NotConfigured    = newError(2005, "S3 storage is not configured.")

	// more biz errors
	ErrEmailAlreadyUse    = newError(3001, "The email is already in use.")
	ErrUsernameAlreadyUse = newError(3002, "The username is already in use.")
	ErrAvatarSizeExceeded = newError(3003, "avatar size exceeded")
	ErrAvatarTypeInvalid  = newError(3004, "avatar type invalid")

	// domain errors
	ErrAIAnalysisNoExists  = newError(4001, "AI analysis no already exists")
	ErrAIAnalysisNotFound  = newError(4002, "AI analysis not found")
	ErrBugNoExists         = newError(4101, "bug no already exists")
	ErrBugNotFound         = newError(4102, "bug not found")
	ErrDeviceNoExists      = newError(4201, "device no already exists")
	ErrDeviceNotFound      = newError(4202, "device not found")
	ErrDeviceUDIDExists    = newError(4203, "device UDID already exists")
	ErrProjectCodeExists   = newError(4301, "project code already exists")
	ErrProjectNotFound     = newError(4302, "project not found")
	ErrRequirementNoExists = newError(4401, "requirement no already exists")
	ErrRequirementNotFound = newError(4402, "requirement not found")
	ErrCaseNoExists       = newError(4501, "test case no already exists")
	ErrCaseNotFound       = newError(4502, "test case not found")
	ErrPlanNoExists       = newError(4601, "test plan no already exists")
	ErrPlanNotFound       = newError(4602, "test plan not found")
	ErrSuiteNoExists      = newError(4701, "test suite no already exists")
	ErrSuiteNotFound      = newError(4702, "test suite not found")
	ErrFeedbackNoExists   = newError(4801, "feedback no already exists")
	ErrFeedbackNotFound   = newError(4802, "feedback not found")
	ErrAIProviderNoExists = newError(4901, "AI provider no already exists")
	ErrAIProviderNotFound = newError(4902, "AI provider not found")
)
