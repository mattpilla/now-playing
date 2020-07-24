new Vue({
    el: '#app',
    data: {
        authenticated: false,
        params: {},
        open: false,
        imageUrl: '',
        song: '',
        artist: ''
    },
    created() {
        this.params = this.getHashParams();
        if (this.params.access_token) {
            this.authenticated = true;
        }
    },
    mounted() {
        window.setInterval(() => {
            this.getSong();
        }, 1000);
    },
    methods: {
        /* Derived from Spotify Authentication Guide */
        getHashParams() {
            let hashParams = {};
            let e, r = /([^&;=]+)=?([^&;]*)/g,
                q = window.location.hash.substring(1);
            while (e = r.exec(q)) {
               hashParams[e[1]] = decodeURIComponent(e[2]);
            }
            return hashParams;
        },
        async getSong() {
            if (!this.authenticated) {
                return;
            }
            try {
                let response = await axios.get('https://api.spotify.com/v1/me/player/currently-playing', {
                    headers: {
                        Authorization: `Bearer ${this.params.access_token}`
                    }
                });
                if (response.status === 200) {
                    this.open = true;
                    let data = response.data.item;
                    this.imageUrl = data.album.images[1].url;
                    this.song = data.name;
                    this.artist = data.artists[0].name;
                } else if (response.status === 204) {
                    this.open = false;
                } else {
                    this.open = false;
                    console.error(response);
                }
            } catch (e) {
                console.error(e);
            }
        }
    },
    beforeDestroy() {
        window.clearInterval();
    }
});
