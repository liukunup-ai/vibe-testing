package v1

var (
	// common errors
	ErrSuccess             = newError(0, "ok")
	ErrBadRequest          = newError(400, "Bad Request")
	ErrUnauthorized        = newError(401, "Unauthorized")
	ErrForbidden           = newError(403, "Forbidden")
	ErrNotFound            = newError(404, "Not Found")
	ErrInternalServerError = newError(500, "Internal Server Error")
	ErrServiceUnavailable  = newError(503, "Service Unavailable")

	// more biz errors
	ErrEmailAlreadyUse         = newError(1001, "The email is already in use.")
	ErrUsernameAlreadyUse      = newError(1002, "The username is already in use.")
	ErrEmptyToken              = newError(1003, "token is empty")
	ErrInvalidToken            = newError(1004, "invalid token")
	ErrUnexpectedClaim         = newError(1005, "unexpected claims type")
	ErrTokenExpired            = newError(1006, "token has expired")
	ErrInvalidSigningMethod    = newError(1007, "invalid signing method")
	ErrInvalidKeyLength        = newError(1008, "invalid key length")
	ErrRedisUnavailable        = newError(1009, "redis service unavailable")
	ErrUnexpectedSigningMethod = newError(1010, "unexpected signing method")
	ErrInvalidAccessToken      = newError(1011, "invalid access token")
	ErrInvalidRefreshToken     = newError(1012, "invalid refresh token")
	ErrTokenAlreadyRevoked     = newError(1013, "token already revoked with later expiry")
	ErrAvatarSizeExceeded      = newError(1014, "avatar size exceeded")
	ErrAvatarTypeInvalid       = newError(1015, "avatar type invalid")

	// Project errors (11000-11099)
	ErrProjectCodeExists = newError(11001, "project code already exists")
	ErrProjectNotFound   = newError(11002, "project not found")

	// TestCase errors (11100-11199)
	ErrCaseNoExists = newError(11101, "case number already exists")
	ErrCaseNotFound = newError(11102, "test case not found")

	// TestSuite errors (11200-11299)
	ErrSuiteNoExists = newError(11201, "suite number already exists")
	ErrSuiteNotFound = newError(11202, "test suite not found")

	// TestPlan errors (11300-11399)
	ErrPlanNoExists = newError(11301, "plan number already exists")
	ErrPlanNotFound = newError(11302, "test plan not found")

	// Device errors (11400-11499)
	ErrDeviceNoExists   = newError(11401, "device number already exists")
	ErrDeviceNotFound   = newError(11402, "device not found")
	ErrDeviceUDIDExists = newError(11403, "device UDID already exists")

	// UserFeedback errors (11500-11599)
	ErrFeedbackNoExists = newError(11501, "feedback number already exists")
	ErrFeedbackNotFound = newError(11502, "user feedback not found")

	// Bug errors (11600-11699)
	ErrBugNoExists = newError(11601, "bug number already exists")
	ErrBugNotFound = newError(11602, "bug not found")

	// Requirement errors (11700-11799)
	ErrRequirementNoExists = newError(11701, "requirement number already exists")
	ErrRequirementNotFound = newError(11702, "requirement not found")

	// AIProvider errors (11800-11899)
	ErrAIProviderNoExists = newError(11801, "AI provider number already exists")
	ErrAIProviderNotFound = newError(11802, "AI provider not found")

	// AIAnalysisResult errors (11900-11999)
	ErrAIAnalysisNoExists = newError(11901, "AI analysis number already exists")
	ErrAIAnalysisNotFound = newError(11902, "AI analysis result not found")
)
