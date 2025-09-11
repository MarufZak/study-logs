# Grokking Web Application Security

![Grokking Web Application Security book cover](./assets/book-cover.jpg)

My notes and takeaways from the Grokking Web Application Security book by Malcolm McDonald.

Table of contents

- [Know your enemy](#know-your-enemy)

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
