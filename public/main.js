new Vue({
    el: '#app',
    data: {
        authenticated: false,
        params: {},
        imageUrl: '',
        song: '',
        artist: ''
    },
    mounted() {
        this.params = this.getHashParams();
        if (this.params.access_token) {
            this.authenticated = true;
        }
        history.replaceState({}, document.title, '.'); // remove hash from url
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
                let res = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
                    headers: {
                        Authorization: `Bearer ${this.params.access_token}`
                    }
                });
                if (res.status === 200) {
                    let data = await res.json();
                    data = data.item;
                    this.imageUrl = data.album.images[1].url;
                    this.song = data.name;
                    this.artist = data.artists[0].name;
                } else if (res.status !== 204) {
                    console.error(res);
                }
            } catch (e) {
                // TODO: check that error is that code expired
                let res = await fetch(`/refresh?refresh_token=${this.params.refresh_token}`);
                let data = await res.json();
                this.params.access_token = data.access_token;
            }
        }
    },
    beforeDestroy() {
        window.clearInterval();
    }
});
