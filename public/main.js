new Vue({
    el: '#app',
    data: {
        authenticated: false,
        accessToken: '',
        refreshToken: '',
        imageUrl: '',
        song: '',
        artist: ''
    },
    created() {
        this.accessToken = localStorage.getItem('access_token');
        this.refreshToken = localStorage.getItem('refresh_token');
        if (!this.accessToken) {
            this.setParams(this.getHashParams());
        }
        this.authenticated = !!this.accessToken;
        history.replaceState({}, document.title, '.'); // remove hash from url
        this.getSong();
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
        setParams(data) {
            if (data.access_token) {
                this.accessToken = data.access_token;
                localStorage.setItem('access_token', data.access_token);
            }
            if (data.refresh_token) {
                this.refreshToken = data.refresh_token;
                localStorage.setItem('refresh_token', data.refresh_token);
            }
        },
        async getSong() {
            if (!this.authenticated) {
                return;
            }
            try {
                let res = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
                    headers: {
                        Authorization: `Bearer ${this.accessToken}`
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
                console.error(e);
                // TODO: check that error is that code expired
                let res = await fetch(`/refresh?refresh_token=${this.refreshToken}`);
                let data = await res.json();
                this.setParams(data);
                this.getSong();
            }
        }
    },
    beforeDestroy() {
        window.clearInterval();
    }
});
