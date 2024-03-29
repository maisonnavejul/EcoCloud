<template>
    <div class="login">
        <h2 class="login_title">Welcome Back !</h2>
        <form class="login_form" @submit.prevent="offline_login">
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
</template>

<script>
const test_user = {
    username: 'login',
    psw: 'ecocloud'
}

const response = {
    is_connected: true, 
    message: 'Connexion réussie!', 
    email: null, 
    is_admin: 1
}

export default {
    name: 'Login',
    data() {
        return {
            username: "",
            password: "",
        }
    },

    methods: {
        offline_login() {
            if (this.check_form()) {
                console.log('Please fill in all fields');
                return;
            } 

            if (this.username === test_user.username && this.password === test_user.psw) {
                console.log('Login successful');
                this.parse_res(response);
            } else {
                console.log('Login failed');
            }
        },
        async login() {
            // POST 10.222.7.145:3000/login
            if (this.check_form()) {
                console.log('Please fill in all fields');
                return;
            } 

            console.log("login form submitted");
            
            const req = new Request('http://10.224.0.83:3000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: this.username,
                    psw: this.password
                }),
            });

            const response = await fetch(req);
            const data = await response.json();
            this.parse_res(data);
        },
        
        check_form() {
            return true ? !this.username && !this.password : false;
        },

        parse_res(res) {
            if (!res.is_connected) {
                console.log('Login failed');
            } else {
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
        console.log('Login.vue mounted');
    }
}
</script>