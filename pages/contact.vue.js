var Contact = {
    template: `<div>
        <h1>Contact</h1>
        <p>This is contact page</p>
        <v-alert type="success"></v-alert>

        <v-btn color="deep-purple accent-4" class="white--text" @click="overlay = !overlay">
            Launch Application
            <v-icon right>mdi-open-in-new</v-icon>
        </v-btn>

        <v-overlay :value="overlay">
            <v-progress-circular indeterminate size="64"></v-progress-circular>
        </v-overlay>
    </div>`,

    data() {
        return {
            overlay: false,
        }
    },

    watch: {
        overlay(val) {
            val && setTimeout(() => {
                this.overlay = false
            }, 3000)
        },
    },

};