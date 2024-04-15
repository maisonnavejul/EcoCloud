<template>
    <div class="login_container">
        <div class="login">
            <h2 class="login_title">Welcome Back !</h2>
            <div class="login_failed" v-if="login_failed">
                <p>Une information de connexion est incorrecte</p>
            </div>
            <form class="login_form" @submit.prevent="login">
                <input type="text" 
                    name="username" 
                    placeholder="Username" 
                    class="login_form_input"
                    v-model="username"/>
                <input type="password" 
                    name="password" 
                    placeholder="Password" 
                    class="login_form_input"
                    v-model="password"/>
                <button type="submit" 
                        name="button" 
                        class="login_form_button">Log In</button>
            </form>
        </div>
    </div>
</template>

<script>
import { login as helper_login } from '../../assets/datasets/user.helper';

export default {
    name: 'Login',
    data() {
        return {
            username: "",
            password: "",
            login_failed: false,
        }
    },

    methods: {
        offline_login() {
            if (this.check_form()) {
                return;
            } 

            const user = helper_login(this.username, this.password)
            this.parse_res(user);
        },
        async login() {
            // POST 10.222.7.145:3000/login
            if (this.$store.state.is_offline) {
                this.offline_login();
                return;
            }

            if (this.check_form()) {
                return;
            }
            
            const body = JSON.stringify({
                    username: this.username,
                    psw: this.password
                });
            
            const req = new Request('http://207.180.204.159:8080/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: body,
            });

            const response = await fetch(req);
            const data = await response.json();
            this.parse_res(data);
        },
        
        check_form() {
            return true ? !this.username && !this.password : false;
        },

        parse_res(res) {
            if (!res.is_connected || !res) {
                this.login_failed = true;
            } else {
                this.login_failed = false;
                this.$store.dispatch('login', res)
                    .then(() => {
                        const next_route = !res.email ? '/register' : '/';
                        this.$router.push(next_route);
                    })
                    .catch((error) => {
                        console.error('Error dispatching login action:', error);
                    });
            }
        }
    },

    mounted() {
        console.log('STATE', this.$store.state)
    }
}
</script>

<style>
.login_container {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 80%;
    width: 100%;
}

.login {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    
    height: fit-content;
    width: fit-content;
    padding : 50px 120px;

    font-size: 18px;
    font-weight:700;
    background-color: white;
    box-shadow: 0 2px 3px rgba(0, 0, 0, 0.55);
}

.login_title {
    font-size: 27px;
    margin-bottom: 22px;
    color: #1A281F;
}

.login_failed {
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

.login_form {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 80%;
    max-width: 200px;
    height: 100%;
}


.login_form > * {
    margin-bottom: 5px;
    margin-bottom: 10px;
    width: 100%;
    font-size: 17px;
    height: 25px;
}

.login_form > input {
    border: 0px;
    border-bottom: 1.2px solid #000000;
    outline: none;
}

.login_form > input:focus {
    border-bottom: 1px solid #51BD8F;
}

.login_form_button {
    margin-top: 22px;
    width: 150px;
    height: 30px;
    background-color: #51BD8F;
    border: none;
    border-radius: 15px;
    font-size: 18px;
}
</style>