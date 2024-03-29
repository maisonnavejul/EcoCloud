<template>
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