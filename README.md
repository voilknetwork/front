
# VoilkFront


VoilkFront is the react.js web interface to the world's first and best
blockchain-based social media platform, voilk.com.  It uses
[VOILK](https://github.com/voilknetwork/voilk), a blockchain powered by DPoS Governance and ChainBase DB to store JSON-based content for a plethora of web
applications.   

## Why would I want to use Condenser (voilk.com front-end)?

* Learning how to build blockchain-based web applications using VOILK as a
  content storage mechanism in react.js
* Reviewing the inner workings of the voilk.com social media platform
* Assisting with software development for voilk.com

## Installation

## Building from source without docker (the 'traditional' way):
(better if you're planning to do condenser development)

#### Clone the repository and make a tmp folder

```bash
git clone https://github.com/voilknetwork/voilkFront
cd voilkFront
mkdir tmp
```

#### Install dependencies

Install at least Node v8.7 if you don't already have it. We recommend using
`nvm` to do this as it's both the simplest way to install and manage
installed version(s) of node. If you need `nvm`, you can get it at
[https://github.com/creationix/nvm](https://github.com/creationix/nvm).

Condenser is known to successfully build using node 8.7, npm 5.4.2, and
yarn 1.3.2.

Using nvm, you would install like this:

```bash
nvm install v8.7
```

We use the yarn package manager instead of the default `npm`. There are
multiple reasons for this, one being that we have `voilk-js` built from
source pulling the github repo as part of the build process and yarn
supports this. This way the library that handles keys can be loaded by
commit hash instead of a version name and cryptographically verified to be
exactly what we expect it to be. Yarn can be installed with `npm`, but
afterwards you will not need to use `npm` further.

```bash
npm install -g yarn
yarn global add babel-cli
yarn install --frozen-lockfile
yarn run build
```
To run condenser in production mode, run:

```bash
yarn run production
```

When launching condenser in production mode it will automatically use 1
process per available core. You will be able to access the front-end at
http://localhost:8080 by default.

To run condenser in development mode, run:

```bash
yarn run start
```

It will take quite a bit longer to start in this mode (~60s) as it needs to
build and start the webpack-dev-server.

By default you will be connected to voilk.com's public voilk node at
`api.voilk.com`. This is actually on the real blockchain and
you would use your regular account name and credentials to login - there is
not an official separate testnet at this time. If you intend to run a
full-fledged site relying on your own, we recommend looking into running a
copy of `voilkd` locally instead
[https://github.com/voilknetwork/voilk](https://github.com/voilknetwork/voilk).


## Issues

To report a non-critical issue, please file an issue on this GitHub project.

If you find a security issue please report details to: support@voilk.com

We will evaluate the risk and make a patch available before filing the issue.
