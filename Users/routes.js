import * as dao from "./dao.js";



export default function UserRoutes(app) {
    const createUser = async (req, res) => {
        const user = req.body;
        delete user._id;
        const result = await dao.createUser(user);
        res.json(result);
    };

    const deleteUser = async (req, res) => {
        try {
            const status = await dao.deleteUser(req.params.userId);
            res.json(status);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    };


    const findAllUsers = async (req, res) => {
        const users = await dao.findAllUsers();
        res.json(users);
    };

    const findUserById = async (req, res) => {
        const user = await dao.findUserById(req.params.userId);
        res.json(user);
    };


    const updateUser = async (req, res) => {
        try {
            const { userId } = req.params;
            const status = await dao.updateUser(userId, req.body);
            const updatedUser = await dao.findUserById(userId);
            res.json({ status, user: updatedUser });
        } catch (error) {
            console.error("Error updating user:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    };

    const signup = async (req, res) => {
        const user = await dao.findUserByUsername(req.body.username);
        if (user) {
            res.status(400).json(
                { message: "Username already taken" });
        }
        const currentUser = await dao.createUser(req.body);
        req.session["currentUser"] = currentUser;
        res.json(currentUser);
    };


    const signin = async (req, res) => {
        const { username, password } = req.body;
        const currentUser = await dao.findUserByCredentials(username, password);
        if (currentUser) {
            req.session["currentUser"] = currentUser;
            res.json(currentUser);
        } else {
            res.sendStatus(401);
        }
    };


    const signout = (req, res) => {
        req.session.destroy();
        res.sendStatus(200);
    };


    const profile = (req, res) => {
        const currentUser = req.session["currentUser"];
        if (!currentUser) {
            res.sendStatus(401);
            return;
        }
        res.json(currentUser);
    };


    app.post("/api/users", createUser);
    app.get("/api/users", findAllUsers);
    app.get("/api/users/:userId", findUserById);
    app.put("/api/users/:userId", updateUser);
    app.delete("/api/users/:userId", deleteUser);
    app.post("/api/users/signup", signup);
    app.post("/api/users/signin", signin);
    app.post("/api/users/signout", signout);
    app.post("/api/users/profile", profile);
}
