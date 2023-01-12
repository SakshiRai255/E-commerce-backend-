const { TokenExpiredError} = require("jsonwebtoken");

const AuthRoles = {
    ADMIN : "ADMIN",
    MODERATOR : "MODERATOR",
    USER :"USER"
}
export default AuthRoles;