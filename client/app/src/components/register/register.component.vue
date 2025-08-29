<template>
    <div class="register_container">
        <div class="register">
            <h2 class="register_title">Welcome</h2>
            <div class="register_failed" v-if="register_failed">
                <p>One registration information is missing, please enter at least a username, email and password</p>
            </div>
            <form class="register_form" @submit.prevent="register">
                <input type="text" 
                    name="username" 
                    placeholder="Username" 
                    class="register_username"
                    v-model="username"/>
                <input type="password" 
                    name="password" 
                    placeholder="Password" 
                    class="register_username"
                    v-model="password"/>
                <input type="text"
                    name="email"
                    placeholder="youremail@example.com"
                    class="register_email"
                    v-model="email"/>
                <input type="text"
                    name="firstname"
                    placeholder="First Name"
                    class="register_firstname"
                    v-model="firstname"/>
                <input type="text"
                    name="lastname"
                    placeholder="Last Name"
                    class="register_lastname"
                    v-model="lastname"/>            
                <button type="submit" 
                        name="button" 
                        class="register_button">Register</button>
            </form>
        </div>
    </div>
</template>

<script>
import { register as helper_register } from '../../assets/datasets/user.helper';

export default {
    name: 'Register',

    props: {
        uname: {
            type: String,
            required: false
        },
    },

    data() {
        return {
            username: "",
            password: "",
            email: "",
            firstname: "",
            lastname: "",
            register_failed: false,
        }
    },

    methods: {
        offline_register() {
            if (this.check_form()) {
                this.register_failed = true;
                console.log('Please fill in all fields');
                return;
            } 
            console.log('Add User form submitted successfully');
            const res = helper_register(
                this.firstname,
                this.lastname,
                this.email,
                this.username,
                this.password,
                0,
            )
            this.parse_res(res);
        },

        async register() {
            // PUT 10.222.7.145:3000/updateUser
            if (this.$store.state.is_offline) {
                this.offline_register();
                return;
            }

            if (this.check_form()) {
                this.register_failed = true;
                console.log('Please fill in all fields');
                return;
            }

            this.register_failed = false;

            console.log('Register submitted successfully');

            const body = JSON.stringify({
                username: this.username,
                password: this.password,
                email: this.email ? this.email : null,
                firstname: this.firstname ? this.firstname : null,
                lastname: this.lastname ? this.lastname : null
            });
            
            let username = this.$store.getters.get_user_state.username;
            if (this.$props.uname) {
                username = this.$props.username;
            }

            const req = new Request(`http://207.180.204.159:8080/updateUser/${username}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: body,
            });
            
            console.log(body)
            console.log(req)
            const response = await fetch(req);
            const data = await response.text();
            console.log(data);
            this.parse_res(data);
        },

        parse_res(data) {
            if (data.includes('mis à jour avec succès')) {
                console.log('Registration successful');

                if (this.$store.state.previous_route !== '/login') {
                    this.$router.push(this.$store.state.previous_route);
                }
                else {
                    this.$router.push('/');
                }
            } else {
                console.log('Registration failed');
            }
        },

        check_form() {
            return !this.username || !this.password;
        }
    },

    mounted() {
        console.log('Register.vue mounted');
    }
}
</script>

<style>
.register_container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 80%;
    width: 100%;
}

.register {
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

.register_title {
    font-size: 27px;
    margin-bottom: 22px;
    color: #1A281F;
}

.register_failed {
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

.register_form {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: 200px;
    height: 100%;
}

.register_form > * {
    margin-bottom: 5px;
    margin-bottom: 10px;
    width: 100%;
    font-size: 17px;
    height: 25px;
}

.register_form > input {
    border: 0px;
    border-bottom: 1.2px solid #000000;
    outline: none;
}

.register_form > input:focus {
    border-bottom: 1.2px solid #51BD8F;
}

.register_button {
    margin-top: 22px;
    height: 30px;
    width: 150px;
    background-color: #51BD8F;
    border: none;
    border-radius: 15px;
    font-size: 18px;
}
</style>