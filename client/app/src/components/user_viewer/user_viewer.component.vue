<template>
    <div class="user_viewer">
        <div class="user_role">
            <img src="../../assets/icons/user_icons/user.png" 
                 class="user_icon" 
                 title="User"
                 v-if="is_admin == 0"/>
            <img src="../../assets/icons/user_icons/admin.png" 
                 class="user_icon" 
                 title="Admin User"
                 v-else/>
        </div>
        <div class="user_viewer_content">
            <div class="user_infos">
                <p>{{ username }}</p>
            </div>
            <div class="user_email">
                <p>{{ email? email: 'No Email' }}</p>
            </div>
            <div class="user_name" v-if="fullname">
                <h2>{{ fullname? fullname: 'No Username' }}</h2>
            </div>
            
        </div>
        <div class="user_actions">
            <img src="../../assets/icons/actions_icons/pencil.png" 
                 class="user_action_btn edit_button" 
                 @click="edit_user"/>
            <img src="../../assets/icons/actions_icons/delete.png"
                 class="user_action_btn delete_button" 
                 @click="delete_user"
                 v-if="is_self"/>
        </div>
    </div>
</template>

<script>
export default {
    name: 'UserItem',
    props: {
        username: {
            type: String,
            required: true
        },
        is_admin: {
            type: Number,
            required: true
        },
        firstname: {
            type: String,
            required: true
        },
        lastname: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },   
    },

    data() {
        return {
            fullname: null,
            name_blacklist: ['', ' ']
        }
    },

    methods: {
        async delete_user() {
            const req = new Request(`http://207.180.204.159:8080/deleteUser/${this.$props.username}`, {
                method: 'DELETE',
            });

            const response = await fetch(req);

            console.log(response);
            this.$emit('refresh')
        },

        async edit_user() {
            const props = {
                username: this.username, 
            }
            this.$router.push({path: '/register', params: props} );
        },

        is_self() {
            return this.$store.state.user.username == this.username;
        }
    },

    mounted() {
        if (this.firstname 
            && this.lastname 
            && !this.name_blacklist.includes(this.firstname) 
            && !this.name_blacklist.includes(this.lastname)) 
        {
            this.fullname = `${this.firstname} ${this.lastname}`;
        } else if (this.firstname && !this.name_blacklist.includes(this.firstname)) {
            this.fullname = this.firstname;
        } else if (this.lastname && !this.name_blacklist.includes(this.lastname)) {
            this.fullname = this.lastname;
        } else {
            this.fullname = null
        }
    }
}
</script>

<style>
.user_viewer {
    margin-bottom: 5px;
    padding: 10px 15px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;

    width: 350px;
    height: 50px;
    border-radius: 15px;

    background-color: white;
}

.user_viewer_content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 70%; 
}

.user_name {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
}

.user_actions {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
}

.user_action_btn {
    width: 16px;
    height: 16px;
    cursor: pointer;
    margin-left: 10px;
}

.user_infos {
    font-weight: 600;
    font-size: 1.1em;
    margin-bottom: 5px;
}

.user_email, .user_name {
    font-size: 0.9em;
}

</style>