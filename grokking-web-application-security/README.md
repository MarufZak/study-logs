# Grokking Web Application Security

![Grokking Web Application Security book cover](./assets/book-cover.jpg)

My notes and takeaways from the Grokking Web Application Security book by Malcolm McDonald.

Table of contents

- [Know your enemy](#know-your-enemy)
- [Browser security](#browser-security)

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

![Screenshot 2025-09-11 at 07.05.44.png](attachment:b3b2a47e-c0bb-48ac-857b-df20372639f5:Screenshot_2025-09-11_at_07.05.44.png)

Engine that executes JavaScript is called _JavaScript engine._ When loading these scripts from internet, scripts can do anything, so engine is careful about what the scripts can do.

![Screenshot 2025-09-11 at 07.09.55.png](attachment:e23986f7-f78e-4b31-8ab2-534cd44befe7:Screenshot_2025-09-11_at_07.09.55.png)

For security concerns, browsers implement _sandboxing,_ where each web page is given a separate process, and limitations exist on it. For example, no interprocess communication, no disk access, no memory reads.

Before executing javascript, browser asks 3 questions: What javascript am i allowed to execute? What tasks should javascript be allowed to perform? How can i be sure that i am executing correct javascript code?

- What javascript am i allowed to execute?
  We can answer this question with Content Security Policies (CSP). These are directives that restrict browser to execute javascript loaded from URLs not specified. It can be set in HTTP response of the HTML document, or hardcoded in meta tag of HTML document.
  ![Screenshot 2025-09-11 at 08.09.18.png](attachment:0f532a67-a377-4919-b2ab-14f080f84189:Screenshot_2025-09-11_at_08.09.18.png)

- What tasks should javascript be allowed to perform?
  CSPs enables locking down resources by domain. Browser also uses domain for other security protections. This is about same-origin policy. Origin is a combination of protocol, domain, and port. If origin is the same across windows, browsers let them communicate via JavaScript.
  ![Screenshot 2025-09-11 at 08.17.46.png](attachment:61fcd755-2e87-458b-8175-748e0067be05:Screenshot_2025-09-11_at_08.17.46.png)
  Origin also dictates how communication with the server is done. Web page communicates with the origin server where it came from to load images, or scripts.
  In browser, cross-origin writes (clicking to a link that leads to another website) is allowed, cross-origin embeds (for example loading images from external origins, as long as CSP allows) is allowed, but cross-origin reads is not allowed.
  In javascript, we can load resources with XMLHttpRequest, or fetch. By default, these are allowed to request data from the same origin. But sometimes we want to load form external sources. The web server from which we are trying to read from, should set up _cross-origin resource sharing (CORS),_ this is setting HTTP headers starting with _Access-Control._ For example, setting \_Access-Control-Allowed-Origin: `https://trusted.com` makes sure only requests from specified origin are allowed.
  Limitation should be minimum. Consider a case where bank server allows requests from all origins. User is logged in, and malicious website sends request to the bank to get the credentials of the user.
  ![Screenshot 2025-09-11 at 08.41.10.png](attachment:f36be5a0-8b22-4e98-913e-3aee78897460:Screenshot_2025-09-11_at_08.41.10.png)
- How can i be sure that i am executing correct javascript code?
  We load javascript files, and these files might not be what author intended. For example, when using CDN, or any server, hackers might replace these files with malicious ones, or use MITM (monster in the middle) attack that intercepts the requests and replace files in response. In this case, there is _subresource integrity check_ that can be done to protect. Script tag has also `integrity` attribute. This contains output produced by SHA-384 hashing algorithm. When provided this value, whenever browser loads this script tag from specified URL, it can recalculate the output and compare. If the script is even slightly different, the code is not executed.
  ![Screenshot 2025-09-11 at 08.51.28.png](attachment:d8ca12aa-2b7a-446d-a127-990830db4e97:Screenshot_2025-09-11_at_08.51.28.png)
