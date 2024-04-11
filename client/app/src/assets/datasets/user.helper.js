import user_dataset from './user.dataset';

export const get_user_list = () => {
    const users = user_dataset.map(user => {
        return {
            id: user.id,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            username: user.username,
            is_admin: user.is_admin,
        }
    })
    return users;
}

export const login = (username, password) => {
    const user = user_dataset.find(user => user.username === username && user.password === password);

    if (!user) {
        return null;
    } else {
        return {
            is_connected: true, 
            message: 'Connexion réussie!', 
            email: user.email, 
            is_admin: user.is_admin
        }
    }
}

export const register = (firstname, lastname, email, username, password, is_admin) => {
    const user = user_dataset.find(user => user.username === username);

    if (user) {
        return 'Le compte a été mis à jour avec succès.'
    } else {
        return 'Utilisateur ajouté avec succès'
    }
}