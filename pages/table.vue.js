var Table = {
    template: `<div>
        <v-alert
            v-model="alert"
            dismissible
            color="cyan"
            border="left"
            elevation="2"
            colored-border
            icon="mdi-format-list-bulleted-square">
            Fill out the form to load the data
        </v-alert>

        <v-card class="mb-3">
            <v-card-title>
                Remote DB
            </v-card-title>

            <v-form ref="form" v-model="valid" lazy-validation @submit.prevent="submit">
                <v-container>
                <v-row justify="space-around">
                    <v-col
                    cols="6"
                    sm="2"
                    >
                    <v-text-field
                        v-model="form.host"
                        :rules="hostNameRules"
                        label="Host name"
                        required
                    ></v-text-field>
                    </v-col>

                    <v-col
                    cols="6"
                    sm="2"
                    >
                    <v-text-field
                        v-model="form.port"
                        label="Host port"
                    ></v-text-field>
                    </v-col>

                    <v-col
                    cols="6"
                    sm="2"
                    >
                    <v-text-field
                        v-model="form.db_name"
                        :rules="hostUsernameRules"
                        label="DB name"
                        required
                    ></v-text-field>
                    </v-col>

                    <v-col
                    cols="6"
                    sm="2"
                    >
                    <v-text-field
                        v-model="form.username"
                        :rules="hostUsernameRules"
                        label="Username"
                        required
                    ></v-text-field>
                    </v-col>

                    <v-col
                    cols="6"
                    sm="2"
                    >
                    <v-text-field
                        v-model="form.pass"
                        :append-icon="showPass ? 'mdi-eye' : 'mdi-eye-off'"
                        :rules="hostPassRules"
                        :type="showPass ? 'text' : 'password'"
                        name="input-10-1"
                        label="Password"
                        @click:append="showPass = !showPass"
                    ></v-text-field>
                    </v-col>
                </v-row>

                <v-row justify="end" class="mb-3">
                    <v-btn @click="clear">
                        clear
                    </v-btn>
                    <spacer/>
                    <v-btn
                        class="mr-4"
                        type="submit"
                        :disabled="!valid"
                    >
                        submit
                    </v-btn>
                </v-row>

                </v-container>
            </v-form>
        </v-card>
        
        <v-card v-if="tables.length" class="mb-3">
            <v-card-title>
                <v-badge color="green" :content="tables.length">
                    Tables available
                </v-badge>
            </v-card-title>

            <v-tabs
                class="mb-3"
                style="overflow-x:auto; white-space: nowrap;"
                show-arrows>

                <v-tabs-slider color="teal lighten-3"></v-tabs-slider>

                <v-tab
                    style="text-decoration: none; color: inherit;"
                    v-for="(item, i) in tables"
                    :key="i"
                    :href="'#tab-' + i"
                    @click="loadTable(item)">
                    <v-badge color="info" :content="item.schema.length">
                        {{ item.name }}
                    </v-badge>
                </v-tab>
            </v-tabs>

            <v-card>
                <v-card-text :loading="table.loading">
                    Select a table to display options
                </v-card-text>
            </v-card>
        </v-card>

        <v-card>
            <v-card-title>
                <v-text-field
                    v-model="table.search"
                    label="Search"
                    single-line
                    hide-details
                    ></v-text-field>
            </v-card-title>
           
            <v-data-table
                :page="table.page"
                :pageCount="table.numberOfPages"
                :headers="table.headers"
                :items="table.data"
                :options.sync="table.options"
                :server-items-length="table.totalData"
                :loading="table.loading"
                class="elevation-1">
                
                <template v-slot:item.logo="{ item }">
                    <img class="img-fluid" :src="item.airline[0].logo" style="width: 10%;" />
                </template>
                <template v-slot:item.website="{ item }">
                    <a :href="'//'+item.airline[0].website" target="_blank">{{ item.airline[0].website }}</a>
                </template>
                
                
            </v-data-table>
        </v-card>
    </div>`,

    data() {
        return {
            
            table: {
                currentTable: null,
                page: 1,
                totalData: 0,
                numberOfPages: 10,
                data: [],
                loading: false,
                search: '',
                options: {},
                headers: [],
            },

            // Tables and schema data
            tables: [],

            // Form Remote DB
            valid: false,
            showPass: false,
            form: {
                host: '',
                port: 3306,
                db_name: '',
                username: '',
                pass: '',
            },

            hostNameRules: [
                v => !!v || 'Host name is required',
            ],
            hostUsernameRules: [
                v => !!v || 'Username is required',
            ],
            hostPassRules: [
                v => !!v || 'Password is required',
            ],
        };
    },
    //this one will populate new data set when user changes current page. 
    watch: {
        "table.options": {
            handler() {
                this.readData();
            },
        },
        deep: true,
    },
    methods: {
        //Reading data from API method. 
        readDataFromAPI() {
            this.table.loading = true;
            const { page, itemsPerPage } = this.table.options;
            let pageNumber = page - 1;
            axios
                .get(
                    "https://api.instantwebtools.net/v1/passenger?size=" +
                    itemsPerPage +
                    "&page=" +
                    pageNumber
                )
                .then((response) => {
                    //Then injecting the result to datatable parameters.
                    this.table.loading = false;
                    this.table.data = response.data.data;
                    this.table.totalData = response.data.totalPassengers;
                    this.table.numberOfPages = response.data.totalPages;
                })
                .catch((error) => {
                    this.tables = [];
                    // Variable required - snackbar = {snackbar.text: String, snackbar.value: Boolean, snackbar.timeout: Number}
                    this.$root.snackbar.text = error;
                    this.$root.snackbar.value = true;
                });
        },

        readData() {
            const { page, itemsPerPage } = this.table.options;
            let pageNumber = page - 1;

            if(this.table.headers.length) {
                this.table.loading = true;
                axios
                    .get(`/dt/get_data.php?size=${itemsPerPage}&page=${pageNumber}&host=${this.form.host}&port=${this.form.port}&db_name=${this.form.db_name}&table=${this.currentTable.name}&username=${this.form.username}&pass=${this.form.pass}`)
                    .then((response) => {
                        // console.log( response ); return;
                        // //Then injecting the result to datatable parameters.
                        this.table.loading = false;
                        this.table.data = response.data.data;
                        this.table.totalData = response.data.total;
                        this.table.numberOfPages = response.data.totalPage;
                    })
                    .catch((error) => {
                        this.table.loading = false;
                        this.tables = [];
                        // Variable required - snackbar = {snackbar.text: String, snackbar.value: Boolean, snackbar.timeout: Number}
                        this.$root.snackbar.text = error;
                        this.$root.snackbar.value = true;
                    });
            }
        },

        // Remote Form methods 
        submit () {
            console.log( this.$refs.form.validate() )
            if( this.$refs.form.validate() ) {
                // console.log( this.$refs.form.$el )
                // return;
                axios.post('/dt/get_remote_tables.php', JSON.stringify(this.form))
                    .then((res) => {
                        //Perform Success Action
                        // console.log(res)
                        this.tables = res.data.data;
                        console.log( this.tables );
                    })
                    .catch((error) => {
                        this.tables = [];

                        // Variable required - snackbar = {snackbar.text: String, snackbar.value: Boolean, snackbar.timeout: Number}
                        this.$root.snackbar.text = error;
                        this.$root.snackbar.value = true;
                        // error.response.status Check status code
                    }).finally(() => {
                        //Perform action in always
                        console.log('Finally run this script')
                    });
            }
        },
        clear () {
            this.$refs.form.reset()
        },

        loadTable(item) {
            console.log( item )
            this.table.loading = true;
            // Remove old table data
            this.table.data = []
            // Prepare table headers
            this.currentTable = item
            let currentHeaders = [];
            this.currentTable.schema.forEach(schema => {
                currentHeaders.push( { text: schema.Field, value: schema.Field } );
            });
            this.table.headers = currentHeaders
            this.table.page = 1;
            this.table.totalData = 0;
            // update 

            this.readData();
        }
    },
    computed: {
    },

    //this will trigger in the onReady State
    mounted() {
        // this.readData();
    },

};