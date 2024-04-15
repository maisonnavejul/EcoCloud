<template>
    <div class="add_user_container">
        <div class="add_user">
            <h2 class="add_user_title">Add a new user</h2>
            <div class="add_user_failed" v-if="add_user_failed">
                <p>Une information d'enregistrement est incorrecte</p>
            </div>
            <form class="add_user_form" @submit.prevent="add_user">
                <input type="text" 
                    name="username" 
                    placeholder="Username" 
                    class="add_user_username"
                    v-model="username"/>
                <input type="password" 
                    name="password" 
                    placeholder="Password" 
                    class="add_user_username"
                    v-model="password"/>
                <input type="text"
                    name="email"
                    placeholder="youremail@example.com"
                    class="add_user_email"
                    v-model="email"/>
                <input type="text"
                    name="firstname"
                    placeholder="First Name"
                    class="add_user_firstname"
                    v-model="firstname"/>
                <input type="text"
                    name="lastname"
                    placeholder="Last Name"
                    class="add_user_lastname"
                    v-model="lastname"/>
                <div class="add_user_is_admin"></div>
                <input type="checkbox"
                    name="is_admin"
                    v-model="is_admin"
                    value="true"
                    class="add_user_is_admin" />   
                <button type="submit" 
                        name="button" 
                        class="add_user_button">{{button_text? button_text: 'Add User'}}</button>
            </form>
        </div>
    </div>
</template>

<script>
import { register } from '../../assets/datasets/user.helper';

export default {
    name: 'AddUser',

    props: {
        callback: {
            type: Function,
            required: false
        },
        button_text: {
            type: String,
            required: false
        }
    },
    
    data() {
        return {
            username: "",
            password: "",
            email: "",
            firstname: "",
            lastname: "",
            is_admin: false,
            add_user_failed: false,
        }
    },

    methods: {
        offline_add_user() {
            if (this.check_form()) {
                this.add_user_failed = true;
                return;
            } 

            console.log('Add User form submitted successfully');
            res = register(
                this.firstname,
                this.lastname,
                this.email,
                this.username,
                this.password,
                this.is_admin? 1: 0,
            )
            this.parse_res(res);
        },

        async add_user() {
            if (this.$store.state.is_offline) {
                this.offline_add_user()
                return;
            }

            if (this.check_form()) {
                this.add_user_failed = true;
                return;
            }

            this.add_user_failed = false;

            console.log('Add User form  submitted successfully');

            const body = JSON.stringify({
                username: this.username,
                psw: this.password,
                email: this.email,
                firstname: this.firstname ? this.firstname : "",
                lastname: this.lastname ? this.lastname : "",
                is_admin: false,
            });

            const req = new Request('http://207.180.204.159:8080/addUser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: body,
            });
            
            const response = await fetch(req);
            const data = await response.text();
            this.parse_res(data);
        },

        parse_res(response) {
            if (response.includes('Utilisateur ajouté avec succès')) {
                this.$router.push('/admin');
            } else {
                this.username = '';  
                this.password = '';
                this.email = '';
                this.firstname = '';
                this.lastname = '';
            }
        },

        check_form() {
            return !this.username || !this.password || !this.email;
        }
    }
}
</script>

<style>
.add_user_container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 80%;
    width: 100%;
}

.add_user {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    width: fit-content;
    height: fit-content;
    padding: 50px 120px;

    font-size: 18px;
    font-weight: 700;
    background-color: white;
    box-shadow: 0 2px 3px rgba(0, 0, 0, 0.55);
}

.add_user_title {
    font-size: 27px;
    margin-bottom: 22px;
    color: #1A281F;
}

.add_user_failed {
    background-color: rgb(255, 87, 87, 0.6);
    border: 1px solid rgb(143, 55, 55);
    border-radius: 5px;
    width: 45%;
    height: 18%;
    font-size: 14px;
    font-weight: 500;
    text-align: center;
    display: flex;
    align-items: center;
    margin-bottom: 4%;
}

.add_user_form {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: 200px;
    height: 100%;
}

.add_user_form > * {
    margin-bottom: 5px;
    margin-bottom: 10px;
    width: 100%;
    font-size: 17px;
    height: 25px;
}

.add_user_form > input {
    border: 0px;
    border-bottom: 1.2px solid #000000;
    outline: none;
}

.add_user_form > input:focus {
    border-bottom: 1.2px solid #51BD8F;
}

.add_user_button {
    margin-top: 22px;
    height: 30px;
    width: 150px;
    background-color: #51BD8F;
    border: none;
    border-radius: 15px;
    font-size: 18px;
}
</style>