## Dynamic Domain for DNSPod

### Installation

```sh
$ [sudo] npm install -g dpdd
```

### Usage

```
Usage: ddpd [options]

Options:
   -c FILE, --config FILE                   the config file path  [/Users/xadillax/.ddpdrc]
   -t TOKEN, --token TOKEN                  the API token
   -l LANG, --remote-lang LANG              remote server language  [cn]
   -d DOMAIN, --domain DOMAIN               the domain to be loaded
   -s SUB, --subdomain SUB                  the subdomain to be run
   -i MILLISECOND, --interval MILLISECOND   the dynamic domain interval (ms)  [30000]
   -g GETTER, --ip-getter GETTER            specify an IP getter  [CHINAZ]
```

You may specify a configuration file via `-c` options. Or just pass configuration arguments from the command line.

If you have specified a configuration file, it's format should be a JSON object or an array.

```json
{
    "token": "token_id,token",
    "domain": "your.domain.com",
    "subdomains": [
        "@",
        "www",
        "and.so.on"
    ]
}
```

or

```json
[{
    "token": "token_id,token",
    "domain": "your.domain.com",
    "subdomains": [
        "@",
        "www",
        "and.so.on"
    ]
}, {
    "token": "token_id,token",
    "domain": "your.domain.com",
    "subdomains": [
        "@",
        "www",
        "and.so.on"
    ]
}]
```

### API

If you want to use `ddpd` as a package in your own project, you should require it at first.

```javascript
const ddpd = require("ddpd");
```

The specifications of API, and details not mentioned in README, would be referenced at [API document](http://blog.xcoder.in/dpdd/doc).

### Contribute

You're welcome to make pull requests!

「雖然我覺得不怎麼可能有人會關注我」
