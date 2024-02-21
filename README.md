<h1 align="center">&#x2022; Filebase CLI &#x2022;</h1>
<p align="center">Developer Friendly [ <a href="https://docs.ipfs.tech/concepts/what-is-ipfs/" title="What is IPFS?">IPFS</a> | <a href="https://docs.ipfs.tech/concepts/ipns/" title="What is IPNS?">IPNS</a> | S3 ]</p>

## About

The Filebase CLI provides a hybrid data management solution, blending S3-compatible cloud storage with IPFS
(InterPlanetary File System) pinning services. It features robust S3 bucket management, object handling for uploads and
downloads, and seamless integration with IPFS and IPNS (InterPlanetary Naming System) for decentralized storage
operations. The SDK supports advanced data tasks like compiling files into CAR (Content Addressable aRchive) formats and
ensures secure transactions through strong authentication. Designed for varied applications, the Filebase CLI is ideal
for scenarios demanding the dependability of cloud storage combined with the advantages of decentralized, peer-to-peer
storage, catering to diverse needs such as content distribution, data backup, and archival.  Developing InterPlanetary
Applications has never been easier.

### JS Client

Install the package using npm or download a binary from the releases for your supported operating system.

```shell
npm install -g @filebase/cli
```

or yarn:

```shell
yarn global add @filebase/cli
```

### Getting started

The snippet below shows how to create a new bucket, upload a new object to IPFS, publish the object to IPNS, 
delete the object and finally delete the bucket.

To use the CLI in your project, use npm or yarn to install the [`@filebase/cli`](https://www.npmjs.com/package/@filebase/cli) module.  Requires node.js 16+.
You can also find pre-built binaries in the releases section.

```shell
// Login
filebase auth login [key] [secret]
// Create Bucket 
filebase create bucket random-bucket-name
// Set Default Bucket
filebase auth bucket random-bucket-name
// Upload Random File
filebase object upload random-file ./random-file.txt
// Download Random File
filebase object download random-file
// Create IPNS Name
filebase name create myFirstIpnsKey QmQSQYNn2K6xTDLhfNcoTjBExz5Q5gpHHBTqZZKdxsPRB9
// Create IPFS Gateway
filebase gateway create myFirstIpfsGateway
// Create IPFS Pin
filebase pin create my-pin QmTJkc7crTuPG7xRmCQSz1yioBpCW3juFBtJPXhQfdCqGF
```

Full API reference doc for the JS client are available at https://filebase.github.io/filebase-cli