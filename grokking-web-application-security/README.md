# Grokking Web Application Security

![Grokking Web Application Security book cover](./assets/book-cover.jpg)

My notes and takeaways from the Grokking Web Application Security book by Malcolm McDonald.

## Table of contents

- [Know your enemy](#know-your-enemy)
- [Browser security](#browser-security)
- [Encryption](#encryption)
  - [Encryption in transit](#encryption-in-transit)
  - [Encryption at rest](#encryption-at-rest)
  - [Integrity checking](#integrity-checking)
- [Web server security](#web-server-security)

## Know your enemy

Hackers can be divided into 2 groups: _black hat_ hackers, and _white hat_ hackers. Black hat hackers attack our application for financial or political reasons, but white hat hackers attack in order to report security vulnerabilities, before black hat hackers make use of it. White hat hackers leaded to _grey hat_ hackers, who find security vulnerabilities, report, and get paid. Also named bug bounties.

![Black and white hats](./assets/hats.png)

Hackers use automated software and tools. Commonly used is _Linux Kali_, Linux distro including many hacking tools.

White hat hackers also include security researchers. They find the vulnerability, report and demonstrate the exploit to the creators, and when patch version is published, the vulnerability is published in _common vulnerability and exposure (CVE)_ database. Such exploits are encorporated to tools like Metasploit.

Also another way of hacking is _social engineering_. It’s about persuading the user to give original credentials of the system. Sometimes there is even a bad actor in the company, who sells credentials.

_Ransomware_ is a form of malicious software that encrypts the files until money is paid to the attackers. The money is paid via cryptocurrency, so it’s very difficult to trace it.

_Hacktivism_ is type of attack done for political reasons. There are many groups that do that, and security researchers identify them by the signatures they use, and give them fun names.

What does it mean to be hacked? There are many types of hacks.

Attackers can send too many requests, so the web server is down. This is called **Denial of Service (DoS)**. If attackers send too many requests from different servers with different IPs, this is called **distributed denial of service (DDoS**).

Attackers can inject malicious javascript into the page, and this script can do anything. This is called **cross-site scripting (XSS)**. They can steal passwords, and use it across different websites - **password spraying\***.\* Or try millions of passwords to match yours - **credential-stuffing\***.\*

Once hackers have access point to the server, they try to escalate the privileges, and use **_rootkit_** software. When gained root access, they can make your server a node of botnet, or sell the credentials, without you knowing this.

When hackers get access to the database, it’s called **data breach\***.\*

How to protect? There are zero-day vulnerabilities published on websites, or discussed social media. Keep track of. Know the code you are deploying, its dependencies. Log and monitor the activity of the web server. Educate the team about security, and make cross-reviews.

## Browser security

Web applications operate on server-client model. Server sends HTTP response, while client triggers HTTP request. Browser’s job is to take HTML/CSS/JS, and render it on the screen. This is called _rendering pipeline,_ and code that executes it is called _rendering engine_.

![Rendering pipeline](./assets/rendering-pipeline.png)

Engine that executes JavaScript is called _JavaScript engine._ When loading these scripts from internet, scripts can do anything, so engine is careful about what the scripts can do.

![Javascript engine](./assets/javascript-engine.png)

For security concerns, browsers implement _sandboxing,_ where each web page is given a separate process, and limitations exist on it. For example, no interprocess communication, no disk access, no memory reads.

Before executing javascript, browser asks 3 questions: What javascript am i allowed to execute? What tasks should javascript be allowed to perform? How can i be sure that i am executing correct javascript code?

- What javascript am i allowed to execute?
  We can answer this question with Content Security Policies (CSP). These are directives that restrict browser to execute javascript loaded from URLs not specified. It can be set in HTTP response of the HTML document, or hardcoded in meta tag of HTML document.
  ![Browser csp](./assets/browser-csp.png)

- What tasks should javascript be allowed to perform?
  CSPs enables locking down resources by domain. Browser also uses domain for other security protections. This is about same-origin policy. Origin is a combination of protocol, domain, and port. If origin is the same across windows, browsers let them communicate via JavaScript.
  ![Browser window channel](./assets/browser-window-channel.png)
  Origin also dictates how communication with the server is done. Web page communicates with the origin server where it came from to load images, or scripts.
  In browser, cross-origin writes (clicking to a link that leads to another website) is allowed, cross-origin embeds (for example loading images from external origins, as long as CSP allows) is allowed, but cross-origin reads is not allowed.
  In javascript, we can load resources with XMLHttpRequest, or fetch. By default, these are allowed to request data from the same origin. But sometimes we want to load form external sources. The web server from which we are trying to read from, should set up _cross-origin resource sharing (CORS),_ this is setting HTTP headers starting with _Access-Control._ For example, setting \_Access-Control-Allowed-Origin: `https://trusted.com` makes sure only requests from specified origin are allowed.
  Limitation should be minimum. Consider a case where bank server allows requests from all origins. User is logged in, and malicious website sends request to the bank to get the credentials of the user.
  ![Browser cors](./assets/browser-cors.png)
- How can i be sure that i am executing correct javascript code?
  We load javascript files, and these files might not be what author intended. For example, when using CDN, or any server, hackers might replace these files with malicious ones, or use MITM (monster in the middle) attack that intercepts the requests and replace files in response. In this case, there is _subresource integrity check_ that can be done to protect. Script tag has also `integrity` attribute. This contains output produced by SHA-384 hashing algorithm. When provided this value, whenever browser loads this script tag from specified URL, it can recalculate the output and compare. If the script is even slightly different, the code is not executed.
  ![Browser integrity](./assets/browser-integrity.png)

## Encryption

Encryption is the process of disguising the input that is not accessible to unauthorized parties. Cryptography is the study of encryption and decryption. Fortunately we don’t need to understand the principles and cores of it to use it. Encryption includes the keys that are used to encrypt and decrypt the data.

If we use the same key for encryption and decryption, we are using _symmetric encryption algorithm,_ that is, separating the data into fixed size blocks, and encrypting each of them.

Encryption key is numbers, but to make it easier to read, they are represented as strings. If size of key is not enough, it’s possible to decrypt it by trying out many keys.

If we use different keys for encryption and decryption, we are using asymmetric encryption algorithm. In this case, anyone with encryption key (public key) can encrypt the message, but the only party that has decryption key (private key) can decrypt it. This setup is known as _public key cryptography_.

![Encryption and decryption](./assets/encryption-decryption.png)

_Hashing algorithm_ is encryption type, whose output cannot be decrypted. Also there is near-zero chance, that two different inputs product the same output (hash collision). Output of such algorithm is called hash, and there is only one way to know which data it used to be - brute force. Useful for knowing the change in the data, without storing the data itself.

### Encryption in transit

Encryption in transit means the usage of encryption algorithms as the data is passed to the network. Protocols such as TLS (Transport Layer Security) and SSL (Secure SL, older and less safer version of TLS) use it.

TLS uses a combination of cryptographic algorithms, called _cipher suit,_ that is exchanged between client and the server at handshake time, and \*\*which contains four algorithms:

1. Key exchange algorithm - used to encrypt the public key, which is required by bulk encryption algorithm.
2. Bulk encryption algorithm - used to encrypt the messages, requires secure key.
3. Authentication algorithm - used to ensure the data goes to the right party.
4. Message authentication code algorithm - used to ensure the received data is the same with the one that was sent.

TLS requires digital certificate, that includes public key, used to establish a connection to the IP address. Certificates are given by certificates authority, but we can sign them ourselves (self-signed certificates). Browser has a list of trusted certificates, and shows warning if our certificate is not trusted.

HTTPS is HTTP traffic passed over TLS connection, so attacker cannot intercept and read the traffic, cannot manipulate the traffic, and cannot spoof the traffic.

![TLS cipher suite](./assets/tls-cipher-suite.png)

Encryption is encouraged via web servers such as NGINX, by redirecting to HTTPS. It can also be done in application servers, using HTTP Strict Transport Security (HSTS), by specifying `Strict-Transport-Security: max-age=123` in HTTP response.

### Encryption at rest

It means encrypting the data being stored in the disk. It’s helpful when sensitive information is stored in the disk, such as configuration stores, databases, backups, and others.

Passwords inside databases should be hashed. Hashing can be done hashing the input with a secret, that is stored in secure location. It can also be done with _salting,_ random string fed into hashing algorithm, that is the same for all passwords or different for each (and stored alongside the password). Actually we can combine these approaches, and use _peppering,_ using (input + random value (pepper)) for each input, and hashing it with salt:

```jsx
bcrypt.hash(myPlaintextPassword + pepper, salt);
```

### Integrity checking

Integrity checking is about checking the data is not altered, and is the same as was sent. This can be done by hashing the data, and sending it alongside the data itself and hashing algorithm. This way the receiver can recalculate the hash to check integrity. For additional security, in cases where attacker can manipulate the data, and recalculate the hash for it, the hash and data + hashing algorithm are passed in different channels. Or they can be passed in the same channel, but having secure keys exchanged beforehand.

## Web server security

Hackers can attack the websites in the browser only indirectly, they might inject some javascript with XSS. But the web servers are accessible directly to anyone, and they can cause trouble.

The first thing to do is validating the input. Hackers usually use bots to attack a web server, and first layer of protection is having allow list, a list of valid inputs. For example currency can be of 2 types, this can serve as an allow list for this field. Allow lists, however, are not suitable for all cases, and it might be easier to implement block list, rather specifying all valid possible inputs. Block list can includes some harmful inputs. Another way is to use pattern matching, against regex. Example is email or date validation with regex, or last digit of credit card is calculated according to Luhn algorithm. In case the request is invalid, it gets rejected immediately.

Files are another input that can be sent to web server, usually formatted as a binary. Files are stored in the disk, so they might be harmful. Simple protection is checking file type in the headers or the name, but it can be misleading, because they can be easily changed, so it’s better to use file type detection libraries. Another protection is validating in the client, but note that hackers usually use bots. It’s best to store them in CMS, or cloud services like S3, away from the web server.

Same as with input, we should also keep the output strict when sending it to downstream systems like database. We should use escaping, replacing special meaning meta-characters with alternatives, that say like “there was <, but don’t treat it as a start of HTML tag”. Most XSS is done in dynamic content places, where the user input is expected and shown. Hackers can simply use `<script><script>` that redirects the user to evil website with cookies attached. To prevent it, we can use escaping, replacing `<>` characters with `&lt; &gt` alternatives. HTML parses them are needed, but doesn’t treat them as tags.

Escaping is also essential against injection attacks, such as sql or command injections. In SQL, `;` can be used to chain the commands. Following command is vulnerable to SQL injections, because hacker can input `'; DROP TABLE users`

`"SELECT * FROM users WHERE email = '" + email + "'"`

Same can happen with command injections, where user input is expected to build a command, like `nslookup {address}`.

Generally, it’s recommended to use higher level APIs, because they come with built in escaping of special-meaning characters.
