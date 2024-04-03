<template>
    <div class="register_container">
        <div class="register">
            <h2 class="register_title">Welcome</h2>
            <form class="register_form" @submit.prevent="offline_register">
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
const data = {
    message: 'Registration successful'
};

export default {
    name: 'Register',
    data() {
        return {
            username: "",
            password: "",
            email: "",
            firstname: "",
            lastname: ""
        }
    },

    methods: {
        offline_register() {
            if (this.check_form()) {
                console.log('Please fill in all fields');
                return;
            } 

            console.log('Register successful');
            this.parse_res(data);
        },

        async register() {
            // PUT 10.222.7.145:3000/updateUser
            if (this.check_form()) {
                console.log('Please fill in all fields');
                return;
            }

            console.log('Register submitted successfully');

            const req = new Request('http://10.224.0.83:3000/updateUser', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: this.username,
                    password: this.password,
                    email: this.email ? this.email : null,
                    firstname: this.firstname ? this.firstname : null,
                    lastname: this.lastname ? this.lastname : null
                }),
            });

            const response = await fetch(req);
            const data = await response.json();
            console.log(data);
            this.parse_res(data);

        },

        parse_res(data) {
            if (data.message) {
                console.log('Registration successful');
                this.$router.push('/');
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
    font-size: 18px;
    font-weight: 700;
    width: 35%;
    height: 75%;
    background-color: white;
    box-shadow: 0 2px 3px rgba(0, 0, 0, 0.55);
}

.register_form {
    display: flex;
    flex-direction: column;
    align-items: center;
    font-size: 15px;
    width: 80%;
    max-width: 200px;
    height: 100%;
}

.register_title {
    font-size: 25px;
    margin-top: 5%;
    margin-bottom: 7%;
}

.register_form > * {
    margin-bottom: 1%;
    margin-bottom: 3%;
    width: 100%;
    font-size: 15px;
    height: 10%;
}

.register_form > input {
    border: 0px;
    border-bottom: 1.2px solid #000000;
    outline: none;
}

.register_form > input:focus {
    border-bottom: 1.2px solid #335145;
}

.register_button {
    border: 0px;
    border-radius: 5px;
    background-color: #335145;
    height: 10%;
    width: 60%;
    margin-top: 10%;
}
</style>