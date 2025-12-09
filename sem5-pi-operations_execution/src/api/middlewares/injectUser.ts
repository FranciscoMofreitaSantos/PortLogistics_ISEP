const injectUser = (req: any, res: any, next: any) => {
    const userEmail = req.headers["x-user-email"];
    const userRole = req.headers["x-user-role"];

    if (!userEmail) {
        return res.status(401).json({ error: "Missing user information from IAM service." });
    }

    req.currentUser = {
        email: userEmail,
        role: userRole || "unknown"
    };

    next();
};

export default injectUser;