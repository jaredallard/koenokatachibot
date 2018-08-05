# Koe no Katachi Bot

Post movies on Twitter in screenshot form for others to enjoy / consume.

## Usage

Configure the bot via `config/config.example.json`, save that as `config/config.json`. 

If you need to get an access_token, use the `scripts/get_access_token.js` script to run a development server
(useful if you have access to an existing app but want to use a different account, thanks Twitter dev rules.)

```bash
$ node server.js

# Or, with Docker
$ ./docker_start.sh
$ docker logs -f <id_dumped_out>
```

## License

BSD-3-Clause