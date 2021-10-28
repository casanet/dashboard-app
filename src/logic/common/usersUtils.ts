import { AuthScopes } from "../../infrastructure/generated/api";

export const mapAuthScopeToDisplay: { [key in AuthScopes]: string } = {
	[AuthScopes.AdminAuth]: 'dashboard.profile.scope.admin',
	[AuthScopes.UserAuth]: 'dashboard.profile.scope.user',
}
