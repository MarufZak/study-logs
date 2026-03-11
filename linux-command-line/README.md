# Linux Command Line

My notes and takeaways from the Linux Command Line book.

![Book Cover](./assets/cover.jpg)

These days companies decide on what users can or can't do with their computers. It's taking freedom out of the users. Linux is going the opposite way, it is giving the freedom. And freedom means knowing and deciding what is exactly happening in your computer.

While GUI makes easy tasks easy, CLI makes difficult tasks possible. Because Linux is modeled after Unix, it has same CLI utilities. And because Unix was first developed long before GUI, it has very extensible list of CLI utilities.

GNU has big impact on Linux, as Linux is the name of kernel, and it cannot be the whole system on its own. GNU provided essential operating system components such as core utilities, built tools, editors, etc. That's why some refer to Linux as GNU/Linux.

## Table of contents

- [Part 1, learning the shell](#part-1-learning-the-shell)
  - [What is Shell](#what-is-shell)
  - [Navigation](#navigation)
  - [Exploring System](#exploring-system)
  - [Navigating Files and Directories](#navigating-files-and-directories)
  - [Working with Commands](#working-with-commands)
  - [Redirection](#redirection)
  - [Seeing the World as the Shell Sees It](#seeing-the-world-as-the-shell-sees-it)
  - [Advanced Keyboard Tricks](#advanced-keyboard-tricks)
  - [Permissions](#permissions)
  - [Processes](#processes)
- [Part 2, configuring environment](#part-2-configuring-environment)
  - [Environment](#environment)
- [Part 3, common tasks and essential tools](#part-3-common-tasks-and-essential-tools)
  - [Package management](#package-management)
  - [Networking](#networking)
  - [Searching for files](#searching-for-files)

## Part 1, learning the shell

### What is Shell

Shell is a program that takes the commands we enter and give to operating system to carry out. Most Linux distributions supply `bash` shell program, which is enhanced version of `sh`, original shell program for Unix.

When using GUI, we need another interface to write commands, it's called terminal emulator. Once we start it, prompt is shown, usually prepended by username, machine name, and current directory. If it ends with `$` sign, it means we are regular user, if with `#`, it means we are root user.

Command history is remembered, usually up to 500 commands.

Basic commands like `date`, `cal`, `free`, `df`

### Navigation

Linux has one filesystem, while Windows uses separate file systems for each device mounted to it. Filesystem is structured as tree-like structure. Basic commands include `ls`, `pwd`, 'cd'.

Most top-level folder is root folder, and can be accessed with `cd /`. Each user has own directory, called home directory, can be accessed with `cd`.

- Linux has no concept of file extension, and content type is determined other way. It uses magic numbers (special bytes patterns at the start of the file, there is `file` command for this too). Though some applications might use its extension to determine the contents.
- In Linux the files are case-sensitive.
- Although many characters are allowed, use dash, dot, or \_ to make a space in filenames, instead of using spaces or other characters. Using spaces makes navigation commands much more harder.

### Exploring System

Commands in Linux come in form of `command -options arguments`. Options control the behavior of the program. There are short options (like `-a` for `ls`), and long options (like `--all` for `ls`). Many short options have corresponding long option.

Here is example output from `ls -la` command:

```bash
ls -la
total 56
drwxr-x--- 5 maruf maruf  4096 Feb 16 13:27 .
drwxr-xr-x 3 root  root   4096 Jan 24 13:18 ..
-rw------- 1 maruf maruf  1761 Feb 16 06:36 .bash_history
-rw-r--r-- 1 maruf maruf   220 Mar 31  2024 .bash_logout
-rw-r--r-- 1 maruf maruf  3771 Mar 31  2024 .bashrc
drwx------ 2 maruf maruf  4096 Jan 24 13:19 .cache
drwx------ 2 maruf maruf  4096 Feb 16 06:10 .docker
-rw-rw-r-- 1 maruf maruf   171 Feb 16 06:22 .env
-rw-r--r-- 1 maruf maruf 12288 Feb 16 06:28 .env.swp
-rw-r--r-- 1 maruf maruf   807 Mar 31  2024 .profile
drwx------ 2 maruf maruf  4096 Feb  5 06:05 .ssh
-rw------- 1 maruf maruf  1336 Feb 16 13:27 .viminfo
```

1. First row has string. First character determines file type, `d` means directory, `-` means file. Next 3 chars determine permissions of the file owner. Next 3 determine permissions for the members of the group of the file, and final 3 is for everyone else.
2. Number of hard links.
3. User name of file owner.
4. Name of group that owns the file
5. Size in bytes
6. Date and time of last modification of file
7. Name of file

Text files can be viewed with `less` command. There is saying `less is more`, which means less does the same job as more (more is old command), but also adds ability to go to viewed lines. Many config files, scripts are written in text format, so this command is useful.

In Unix-like systems it's possible to have same file with different names. Symbolic link (or symlink) is reference to some original file. We can create multiple symlinks that point to some file, and when original file is changed, all programs referencing symbolic links have the file contents changed too. Symbolic link is indicated with `l` as first char when listing with `ls -la`.

---

### Navigating Files and Directories

Most used commands in linux are: `mkdir`, `mv`, `cp`, `rm`, `ln`. While most actions done with these commands can be done with GUI, these commands make it easy to perform tasks that are complex on GUI, for example copy all .html files.

Because filenames are used so much in shell, shell has a feature of listing filenames in convenient way, glob patterns (wildcards).

1. `*` - any character
2. `?` - any single character
3. `[characters]` - any character in set of _characters_
4. `![characters]` - any character not in set of _characters_
5. `[[:class:]]` - any character that is member of specified class. These classes include `[[:lower:]]`, `[[:upper:]]`, `[[:alpha:]]`, `[[:alnum:]]`, `[[:digit:]]`.

`[a-z]` and `[A-Z]` used to work in older version of Linux, they do now too, but they don't produce expected results unless configured properly. The reason `[a-z]` and `[A-Z]` don't work is because from past Unix assumed ASCII ordering, which is `a, b, c, d, ...`, but modern locales (like en_US of UTF8) have different ordering `a A b B c C ...`, so `[a-z]` matches all locales inbetween of `a` and `z`, which include upperacse letters. POSIX character classes (`[[:class:]]`) don't rely on ranges.

`ln` command creates hard link or soft link (with `-s` param).

_Hard link_. If we consider the filename as a reference to the INode (basically struct that stores file's information), creating hard link means creating another filename for the same INode. This means both files refer to same data. Each file has number of hard links attached (second column of `ls -la` command), and if this number becomes 0, file is deleted.
Hard links can't point to directories or point to files inside other disk partitions (meaning it can point to files only in same fileysystem).
Hard links are created with `ln original_file link_file` command.
Hard link is original way of creating links between files in Unix systems.
In order to understand if two files are same file (meaning one of them is hard link), we can use `ls -li`, which prints out INode numbers as first column. If INode numbers match, these are same file.

_Soft link_. Soft link don't have limitations as in hard link. When we create soft link, we create separate INode, which points to the original file's INode.
It accumulates a little space because of the pointer, and the size is pathname size.
When creating symlink, the path is specified relative to symlink location, not current working directory.
Once original file is deleted, soft links becomes broken (usually indicated in terminal emulators as red). Soft link is created with `ln -s original_file link_file` command. Soft link is modern practice.

Almost all file operations operate on end file itself, but `rm` command operates on the link itself.

---

### Working with Commands

Commands can be separated into 4 categories:

1. Executable programs - either compiled binaries or scripts written in some languages, located in `/usr/bin`.
2. Command line builtins - shell (for example bash) provides some builtin commands, also known as shell builtins.
3. Shell functions - functions written in shell script and encorporated into environment.
4. Alises - commands defined with alises.

Here are commands that are helpful when working with commands. Also most commands so far (and followings) come from GNU's `coreutils` package.

_type_ - this command determines which type of command listed above input command is. For example it says `ls` command is alias for `ls --color=auto` (in Ubuntu), or that `mkdir` is executable program located in `/usr/bin/mkdir`.

_which_ - sometimes multiple versions of same command is installed in the system. This command determines where executable program is located. Only works for executable programs, and not for aliases or shell builtins.

_help_ - get documentation for command. This works only for shell builtins (for example `cd` command), and documentation is not very readable. Many executable program commands display how the command's options, usage etc, with `--help` option.

_man_ - display manual page of executable program command. Manual page is not tutorial, but just reference, describing what the command is, its options, usage. It has 8 sections, describing different aspects of command. We can go straightly to some section by providing it with `man number search_term`

_apropos_ - display commands by making a search from available manual pages. Displays command and a match in its manual page. Same effect can be done with `man -k search_term`x

_whatis_ - display brief description of executable program command.

_info_ - alternative to `man`, by GNU project. It reads info files, which are organized in tree-structure, and has hyperlinks.

Docs for commands can also be found in `/usr/share/docs/`, in plain text or even html format.

One more things about commands is that these can be concatinated with `;`. For example `ls; ls; ls` runs `ls` 3 times.

_alias_ - it's possible to create aliases with `alias name='string'` command, where string is command(s) to execute, and name is alias name. For example `alias foo='ls -la'` makes alias for `foo`, so writing `foo` does `ls -la` under the hood. To remove alias `unalias name` command is used. To see all alises use `alias`. Aliases created this way are erased once current session ends.

---

### Redirection

Almost all commands we have dealt so far includes producing outputs or errors. When program executes, it produces some results, or some errors. Knowing that in Unix philosophy everything is a file, output of a program is put in file named _standard output_, named _stdout_. And error is put inside _standard error_, also named _stderr_. Both _stdout_ and _stderr_ are linked to the screen. There is also _stdin_, which is linked to the keyboard by default. With I/O redirection, it's possible to change this behavior.

We can redirect _stdout_ of program to some file. It's done with **>** operator. If file doesn't exist, it's created. Note that file contents are overwritten once **>** is used. To append output to the file, **>>** is used.

Redirecting stderr is a bit harder. Program produces output to file streams. First three are _stdin_, _stdout_, _stderr_. Shell references them internally by file descriptiors 0, 1, 2 respectively. Shell provides notation to redirect files using file descriptor numbers. To redirect _stderr_ to some file, **2>** syntax is used. For example `ls -la nonefile 2> errors.txt`.

Sometimes it's useful to redirect both output and errors to same file. For this `ls -la somefile > files.txt 2>&1` is used. In this case output of command is redirected to the file, and _stderr_ is redirected to _stdout_. Swapping the order of these redirects doesn't work, redirecting _stderr_ should be after _stdout_ redirection.

Modern bash provides another way to redirect both _stdout_ and _stderr_ to same file, for example `ls -la somefile &> files.txt`, with **&>** operator.

To ignore the output and not print on the screen, we can redirect it to `/dev/null`. It's special file in Unix systems that simply does nothing with the input. This file is called bit bucket.

The command to concatenate the files is `cat`. We can specify file names and it outputs the contents for us. But if we don't, it hangs. It waits input from _stdin_, and because it's attached to keyboard, it's waiting for us to type. We can also redirect the _stdin_ from keyboard to some file with following syntax: `cat < files.txt`, so with **<** operator.

Redirection is taken from shell feature called _pipeline_. It's about redirecting stdout to stdin with `|` character. For example `ls -la | less` redirects output to `less` command. So yes, `less` also accepts input from stdin.

We can make pipelines more complex, by adding some layers. These layers might serve as filtering layers. It can be done with `sort`, `uniq`, `grep`, and other commands. These commands are also discussed: `wc` (lines, words, bytes count), `head/tail` (tail has feature of viewing the changes in realtime with `-f` option), `tee` (read from stdin and output to stdout and files).

---

### Seeing the World as the Shell Sees It

When we type a command and press enter, there are some steps shell performs before carrying out our command to the program.

**Expansion**

Expansion is when transforms special characters into the strings, for example `*` char. If we do `echo *` it prints all filenames in current directory (`*` means match all characters in filename). `echo` program doesn't see `*`, but only the results of its expansion.

There are different types of expansions. One of them is pathname expansion. For example `ls -la [[:upper:]]` expands `[[:upper:]]` into filenames matching this pattern.

Another one is tilde expansion. When `~` is used in the beginning of word, it expands to the home directory pathname of current user, or of specified user if specified as `echo ~username`.

It's possible to make arithmetics with arithmetic expansion with `$(( arithmetic ))` syntax. Only integers are supported, so the results are integers too. Adding, substracting, multiplication, division, remainder (%), and exponentation (\*\*) are supported. Expressions can be nested as `$(( $(( arithmetic )) + arithmetic ))` or like `$(( (arithmetic) + arithmetic ))`.

Another type of expansion is brace expansion. It's a pattern surrounded by braces. Pattern can be either some sequence of characters or numbers seperated by comma, or ranges of number or characters. No whitespace in pattern. For example `echo Hello-{World,Man,Book}`, `echo Hello-{1..9}`, `echo Hello-{A..Z}`, `mkdir {2009..2011}-0{1..9} {2009..2011}-{10..12}`.

Another one is parameter expansion. Shell has some variables which we can access with their names. For example `echo $USER` displays current user name. We can see these variables with `printenv | less`. This one is more used in shell scripts.

Another type of expansion is command substituion. We can use output of some command as an argument for commands. For example `echo $(ls | grep data)` prints files matching data in current directory. Or `file $(ls /usr/bin/* | grep zip)`. In older shell programs ``is used instead of `$()`.

**Quoting**

Now we know how expansion works, it's time to understand how to control it. `echo hello      world` prints `hello world`, as these words are treated as separate arguments. This is done by word splitting algorithm. It sees spaces, tabs, newlines as delimeters, and removes unnecessary delimeters. This results to have 2 arguments in this example instead of 1.

To suppress word splitting, we need double quotes. `echo "hello     world"`. When double quotes are used, shell expansions (except parameter expansion, command substituion, arithmetic expansion) lose their meanings.

The fact that word splitting considers newlines as delimeters causes interesting effect. For example output of command `echo $(cal)` is one line string, instead of columns and raws. To fix it `echo "$(cal)"` is used.

To suppress all expansions, single quotes are used. For example `echo '$(cal)'`.

It's also possible to escape special characters with backslash. For example to prevent some single expansion, we would use `echo "Hello $USER, balance is \$123"`. It's also possible to escape special meaning characters (`$`, `&`, ` ` space, `!`) in filenames.

When used inside single quotes, backslash behaves as a regular character.

Besides escaping purpose, backslash also serves as control codes. In ASCII, first 32 characters are used to transmit commands to teletype devices, These includes special characers like `\n` (newline, in Unix it's linefeed), `\b` (backspace), `\a` (bell). Idea of backslash originated in C and was adopted by shell. Fun fact is that `\a` can make beep. In program `sleep 10; echo "Done\a"`, beep is done after 10 seconds.

---

### Advanced Keyboard Tricks

**Command line editing**

Bash uses Readline library (collection of shared routines that other programs can use) to implement command line editing. Some include using arrow keys to move the cursor. There are other key bindings for different types of actions. What i found most interesting are:

1. `CTRL-A` - move to the start of the line
2. `CTRL-E` - move to the end of the line.
3. `ALT-F` - move cursor forward by one word
4. `ALT-B` - move cursor backward by one word
5. `CTRL-L` - clear console and move cursor to top left.

In Readline docs there is keyword _meta_. It modern keyboards it maps to `ALT` key. However in older keyboards it might be different.

Bash also has feature of completion. When typing a command, and pressing Tab, bash can make completion, or list possible completions on double Tab press. Completions are supported for commands, pathnames, hostnames (starting with `@` and listed in `/etc/hosts`), variables (starting with `$`), usernames (starting with `~`). There are also programmable completions to enable some programs to have completion flags, or match specific file types application supports. Distributions usually come with a set of completions, can be seen with `set | less`.

**Using history**

History is a file stored in `~/.bash_history`, by default stores last 500 commands. There are some useful tricks i found useful.

1. When typed `history` command, it displays commands alongside number. When `!number` is entered, history item at number is copied into command line. This is called history expansion.
2. It's possible to perform incremental (search as you type) search in history with `CTRL-R` command. To go to next match, press `CTRL-R` again. Pressing `Enter` causes command to execute.
3. It's possible to record the shell session in some file with `script file` command.

And of course searching in history can be done with regular command `history | grep pattern`.

### Permissions

Linux is not only multitasking system, but also multiuser system. Multiple users can operate on a computer at the same time. Usually computers have only one keyboard and screen, but other users can connect to it with secure shell (ssh), and even have their own GUI remotely.

Some files are not accessible to regular users, for example `/etc/passwd`. This is bound to security model in Unix. User can own a file or directory, and has control over its access. It can grant some access to specified group, and for everybode else (also referred as world). To see the user id, groups user belongs to and their ids, `id` command is used.

Groups, users, etc are taken, as everything in Linux, from files:

1. `/etc/passwd` - defines user accounts.
2. `/etc/group` - defines groups.
3. `/etc/shadow` - information about users passwords.

We can see permissions on files and directories with `ls -la` command, in first column. First char defines file type, next 3 permission bits for owner, next 3 permission bits for group, and rest 3 is for the everyone else.

Symbolic links have all permissions, with `l` file type, and original permissions are specified in target file.

It's possible to change the permissions with `chmod` command. It accepts 2 forms:

1. Octal. Octal digit represents 3 binary digits. This is convenient because we have owner, group, and the world. Each number is translated into binary representation, for example `7 -> 111`, which means access to read/write/execute.
2. Symbolic. It has its syntax i don't like, but it has advantage over octal to add or remove specific permissions, without resetting them.

When file is created, it has default permissions (usually 666). `umask` command lets us specify which permissions to unset by default. In Ubuntu it's `0002`, meaning we do `666 - 002 (ignore first number for now) = 664` to get final permissions. We can set default unsetting permissions with `umask number`.

Although it's common to see 3 octal numbers to represent the permission bits, it's more accurate to represent it with 4 numbers. Because there are some not usually used permissions bits:

1. setuid - when set on executable, it sets _essential user id_ to the one of file's owner, rather than the one who is running the program. It's set with `4000` bit, for example `4644`. Useful when other users need to run a program under root priveleges. Must be kept at minimum because of security concerns. Example permission bits when setuit is set: `-rwSrw-r--`
2. setgid - it sets _essential group id_ to the one of directory. When set on file, when executing some program, group id of file is accounted, not the one who is executing it. When set on directory, files or directories created inside this directory inherits parent directory group permission bits. Useful for shared directories. Set with `2000`, for example `2644`. Example permission bits: `-rw-r-Sr--`.
3. sticky bits - comes from ancient Unix, and makes file "unswappable". Ignored by Linux, but if set on directory, it makes so directory entries cannot be deleted or renamed unless it's directory owner, file owner, superuser is doing it. Set with `1000`, for example `1644`. Example permission bits: `drw-r--r-T`. Often used to control access to shared directory like `/tmp`.

---

Changing identities. There are 2 ways to change identities in shell:

`su` - run some command or start a new shell with substitute user id and group id. It has usage of `su [-l] user`, which is similar to `su - user`. It can be switched to root also, with `su -`.
When this method is used, environment of target user is loaded and shell starts at home directory of target user.
It's also possible to execute specific command with `su -c 'command'`. command is in single quotes in order to prevent expansion in current session.

`sudo` - execute command as another user. It's primarily same as `su`, but with important additions. Administrator can configure which users can run commands in behalf of other users (usually superuser), and which commands exactly. It doesn't require target password, but user's password.
We can see which permissions are given to current user with `sudo -l`.
This command doesn't load environment of target user nor starts a new shell.
Special file `/etc/sudoers` is configured by administrators to restrict which commands can be executed under and for assumed identity.
Some interesting options exist like `-s` to open in a new shell, or `-u` to specify user (if not specified, root is assumed).

In Windows users are granted administrative privileges to do some tasks if administrative privileges are required. This is usually what we want, but it also allows malicious programs to run as administrator if misused.

Linux uses broader gap between root user and regular users. Users can switch inbetween with `su` or `sudo` commands (giving administrative privileges only when necessary). This caused a problem. Many users started to use root user as default in order to avoid permission denied errors. This means problem arose in Windows is same in Linux.

To prevent it, Ubuntu decided to lock root user and reject connecting as root. Instead it grants all superuser privileges to initial user (by adding it to sudo group which allows it to run commands with `sudo` as root). Initial user can do same for other users.

---

It's possible to change file owner or group owner of file or directory with `chown` command. The syntax is `chown [user]:[[group]]`. Here are examples:

1. `chown bob file` - changes file owner to bob, group remains same
2. `chown bob:bobgroup file` - changes file owner to bob and group to bobgroup
3. `chown :bobgroup file` - changes group to bobgroup
4. `chown bob: file` - changes owner to bob and group to bob's login group (primary group)

There is `chgrp` command too, but it's old and more limited.

Some other useful commands:

1. `adduser` - create user, interactive
2. `groupadd` - create group
3. `usermod` - modify user account, `usermod -aG group username` adds user to group.
4. `passwd` - modify current user password, or specify username to change other's if you have superuser priveleges.

### Processes

Modern operating systems have feature of `multiprocessing`, meaning it can make an illusion of executing multiple tasks at the same time, but instead switches between the tasks periodically. Linux manages it with `processes`, instance of programs in execution, to somehow keep track of the programs running. Process has its id (PID), user id, etc.

First process is created when system is starting, with init shell script. It creates other processes, mostly which run in the background (daemon). Init process has PID of 1, and next processes have their PIDs incremented. Init shell script creates a process, which itself creates other processes. This is called parent process creating child processes.

Processes can be inspected with `ps` command, which reports snapshot of current processes. By default it outputs processes running in current terminal session:

```bash
PID TTY          TIME CMD
6303 pts/0    00:00:00 bash
6399 pts/0    00:00:00 ps
```

`TTY` field indicates terminal associated with the process, and `TIME` indicates CPU time the process is consuming.

There is `x` option, which displays processes regardless of the terminal session. It means processes with no terminal session are displayed too. These are indicated by `?` in TTY column.

```bash
PID TTY      STAT   TIME COMMAND
964 ?        Ss     0:00 /usr/lib/systemd/systemd --user
965 ?        S      0:00 (sd-pam)
1066 ?        S      0:00 sshd: ubuntu@notty
6302 ?        S      0:00 sshd: ubuntu@pts/0
6303 pts/0    Ss     0:00 -bash
6420 pts/0    R+     0:00 ps x
```

`STAT` refers to the state of the process:

1. `R` - running or runnable (waiting for CPU to pick up)
2. `S` - sleeping, can be interrupted, waiting for events.
3. `D` - sleeping, cannot be interrupted, usually waiting for events like I/O.
4. `T` - stopped, by signal or debugger.
5. `Z` - zombie, terminated but not yet reaped up by parent.

There are other flags shown after state:

1. `<` - high priority process, given more CPU time than usual. Not `nice`, because takes more CPU time.
2. `N` - nice process, takes less CPU time to be polite to other processes.
3. `L` - pages locked in memory and cannot be swapped to disk.
4. `s` - session leader, a process which started session group, typically `bash` shell. If it dies, all processes inside session group hang.
5. `l` - multi threaded, started multiple threads.
6. `+` - foreign process group, runs in foreground, and can recieve keyboard input.

There is another preset, `aux`, which displays all the processes across all users, both with terminal session associated and without.

```bash
USER         PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root           1  0.0  1.2  22044 12564 ?        Ss   04:02   0:03 /sbin/init
root           2  0.0  0.0      0     0 ?        S    04:02   0:00 [kthreadd]
root           3  0.0  0.0      0     0 ?        S    04:02   0:00 [pool_workqueue_release]
```

1. `User` - username that started a process, process owner
2. `CPU` - CPU time in percentage (average from process lifetime)
3. `MEM` - memory taken in percentage
4. `VSZ` - virtual memory size, total memory process could use
5. `RSS` - redident set size in kb, actual size of RAM taken.
6. `START` - date or time process started.
7. `TIME` - total CPU time consumed.
8. `COMMAND` - command that launched the process.

`ps` command is good, but it catches the snapshot of processes at the time it's called. To monitor processes in real time, `top` command can be used. It has 2 sections:

_General section_ about system information

1. Such as current time, uptime, users logged in.
2. Average load (average number of processes waiting for CPU) in last 1 minute, 5 minutes, and 15 minutes. If value is less than 1, CPU is not busy.
3. Total number of tasks (processes) in different states.
4. CPU used by user processes (`us`), by system processes (`sy`), nice processes (`ni`), idle (`id`), waiting for I/O (cpu idle, `wa`), handling hadrware interrupts like keyboard (`hi`), handling software generated signals (`si`), CPU time stolen by hypervisor (software managing virtual machines) (relevant in VM) (`st`).
5. Number of total physical RAM, unused RAM, used RAM, buff/cache - used by kernel for caching, can be freed up if processes need it.
6. Total swap space on disk, unused swap, used swap (data moved from RAM to disk due to memory pressure), avail memory - estimated memory without swapping, includes buff/cache that can be reclaimed.

_Processes section_

1. `PR` - priority of process for kernel, lower - higher priority.
2. `NI` - user-set nice value, lower - nicer. `PR` is calculated based on it, so `NI` affects priority of process.
3. `VIRT` - total memory process reserved, may not be fully in RAM.
4. `RES` - actual RAM process is consuming.
5. `SHR` - portion of RES that is shared with other processes, for example shared libs. They are loaded into RAM once and reused.
6. And others we already know like `S`, `TIME+` (total CPU time consumed since process started),

Processes can be controlled. For example there is `xlogo` command that opens a window, this is example program. This program can be interrupted (politely asked to terminate) with `CTRL+C`. Many programs can be interrupted this way.

We can also start the program in the background with `command &`, for example `xlogo &`, or `yes &`. Note that `yes &` still runs in the background, but stdout is still connected to the terminal (this can be viewed with `ps` command TTY column). It's possible to forward stdout to `/dev/null`. Running program in background gives job_spec (basically job id), and PID.

Another way to run the program in background is `bg %job_spec` command. For this we need to obtain job_spec, which can be obtained by stopping the program. Stopping the program can be done with `CTRL+Z`, which gives job_spec.

Stopped process - process is paused, frozen in memory, can be resumed.
Interrupted process - process told to terminate, cannot be resumed.

Process can be returned to foreground with `fg %job_spec` command.

Both `bg` and `fg` can accept no job_spec if there is only 1 job in job table (list of jobs shell tracks for current shell session).

Jobs can be viewed with `jobs` command.

_Signals_

`kill` command can be used to terminate the processes, by specifying PID or job_spec, like `kill 123` or `kill %1`. But kill under the hood sends signals.

Signals are a way OS communicates with processes. Processes can listen for these signals and react, or completely ignore. `CTRL+C` and `CTRL+Z` send `INT` (interrupt) and `TSTP` (terminal stop) signals respectively.

Signals can be specified by syntax: `kill -signal PID|job_spec`. Note that signal can be either number or name, prepended by `SIG`, for example `kill -SIGINT 231`

Ability of programs to listen to signals is to do clean up work when they are received, and terminate properly.

Essential signals to know:

| #   | Name  | Catchable      | Default Behavior      | Description                                                                                                                                                                                                                                   |
| --- | ----- | -------------- | --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | HUP   | Yes            | Terminate             | Hung up, sent to the processes whose parent process dies or terminal closes.                                                                                                                                                                  |
| 2   | INT   | Yes            | Terminate             | Interrupt, sent with `CTRL+C`.                                                                                                                                                                                                                |
| 9   | KILL  | **No**         | Terminate             | Not sent to application program, instead kernel terminates the process itself.                                                                                                                                                                |
| 11  | SEGV  | Yes (bad idea) | Terminate + core dump | Sent to process who tried to access invalid memory (not allowed to write).                                                                                                                                                                    |
| 15  | TERM  | Yes            | Terminate             | Polite ask to terminate. Technically same as `INT`, but applications might use them in different purposes, for example `INT` for task cancellation, and `TERM` for graceful process termination. This is default command `kill` signal sends. |
| 17  | STOP  | **No**         | Stop                  | Force stop of the program, it's not sent to application program. Program stops executing, gets no CPU time, until `CONT` is received.                                                                                                         |
| 18  | CONT  | Yes            | Continue              | Continue stopped process.                                                                                                                                                                                                                     |
| 20  | TSTP  | Yes            | Stop                  | Stop the program, can be catched unlike `STOP`.                                                                                                                                                                                               |
| 28  | WINCH | Yes            | Ignore                | Terminal window has resized. Applications like `top` make redrawings after receiving this signal.                                                                                                                                             |

All signals can be viewed with `kill -l`. Only signals that cannot be catched at application level are `SIGKILL` and `SIGSTOP`.

## Part 2, configuring environment

I decided to write only about environment section. Other 2 sections are about introduction to `vi`, and configuring the prompt.

### Environment

Environment is body of data shell session holds, used by programs as configuration file to determine the behavior. Many programs use config files instead, but environment variables (pieces of data in environment) are sometimes read too.

There are 2 things that are stored in environment:

1. Environment variables - everything that is not shell variable
2. Shell variables - variable set up by shell

Shell also stores aliases and shell scripts.

We can see the environment with 2 commands:

1. `set` - prints environment containing both env variables and shell variables.
2. `printenv` - print only env variables. We can also print single environment variable value like this `printenv HOME`

Some interesting variable is `PATH`. It's colon sepratad string. When executing some command, shell reads directories specified in `PATH` to find executable file.

These variables are established by reading startup files. Startup files depend on shell type. There are 2 shell types:

1. Login - appears when specifying username and password to login. In this case, shell reads `/etc/profile` as global startup file for all users, and reads: `~/.bash_profile`, if not found -> `~/.bash_login`, if not found -> `~/.profile`. Global startup files are usually configured to read `~/bashrc` too.
2. Non-login - when shell is started after being logged in, appears typically when starting session in GUI. Reads `/etc/bash.bashrc` for global config script, and `~/.bashrc` for user's personal startup config script.

In startup files we can see `export VARIABLE` syntax, this is done to make the variable avaiable to child processes.

We can edit the startup files. After editing them, the changes are not applied, because startup files are read once when starting a shell session. We can make shell reread it with `source ~/.bashrc` command.

## Part 3, common tasks and essential tools

### Package management

There are many Linux distributions out there, and different people prefer different distributions. Some make preference of styles, colors, defaults, but one major component is package management.

Package management is about installing and managing package in the system.

It's used to be following way: some source code is installed in the system, compiled, and used. It's done this way too, but many Linux distributions provide ability to install precompiled programs, because it's faster and easier, with package managers.

There are different types of packaging systems, and most distributions use one of two:

1. Debian style - `.deb`, used by Debian, Ubuntu, and others.
2. Red Hat style - `.rpm`, used by Red Hat Enterprise Linux, Fedora, CentOS, and others.

Usually package intended for one packaging system or distribution is not compatible on another.

Basic unit of package management is package, which includes source program files, its metadata, and some pre/post scripts before/after installation.

Package that distribution supplies is compiled by `package maintainer`, a person who pulled source code, optionally modified so it works well with the distribution, and mainains it. This person is often an employee of distribution vendor. The package is pulled from `upstream provider` - code owner.

Distributions have central repositories where the packages are installed from. These repositories have different stages, for example testing, development, each containing respective packages that are being tested and being developed.

Distributions have also related third-party repositories, not maintained by them, because of patent, legal issues, or just because of quality standards. To install them including them in package management system conifgs is required.

Packages have some shared routines for doing some basic tasks. It's called packages have dependencies. When installing a package, package manager makes sure the shared depenencies (libraries) are installed too.

_Packaging tools_

There are packaging tools (package managers) for Debian style packaging systems and Red Hat style packaging systems. I will write about Debian style only.

There are 2 types of package managers:

1. High level - `apt-get`, which includes dependency resolution (installing any other necessary dependency not installed in the system).
2. Low level `dpkg`, doesn't have dependency resolution. If it doesn't find dependency installed in system, it outputs errors or warnings.

When using `apt-get`, we need to constantly run `apt-get update`, because the repository index is saved locally. If this local cache is stale, we might install some outdated package version, or get not found errors. So we need to constantly update the local index cache.

To search for a package with `string` metadata:

```bash
apt-get update
apt-cache search string
```

To install a package:

```bash
apt-get update
apt-get install package_name
```

If package is installed directly from source other than repository, it can be installed to system with following, without dependency resolution (package file is some .deb file):

```bash
dpkg --install package_file
```

To remove a package:

```bash
apt-get remove package_name
```

All packages installed in system can be updated at once:

```bash
apt-get update
apt-get upgrade
```

To update a package installed from non-repository source, it can be reinstalled:

```bash
dpkg --install package_file
```

To list all packages installed in system:

```bash
dpkg --list
```

Determine if package is installed:

```bash
dpkg --status package_name
```

Display information about a package if it exists in repository:

```bash
apt-cache show package_name
```

To see which package installed some file. If file is symlink, it's not resolved and searching fails.

```bash
dpkg --search filename
```

In Linux device drivers work pretty much the same way as packages. But instead of being separate in the repository, they are part of Linux kernel. There is no such thing as device disk, either Linux kernel supports it or not. When particular device is not supported, most common reasons are:

1. Device is too new - when this happens, and when hardware vendors don't support Linux development, writing device driver lies upon member of Linux community to write kernel code. This takes time.
2. Device is too exotic - because Linux distributions can modify the kernel code, they come with some supported device drivers by default, while possibly removing others. We can install the kernel source code for device driver, compile it, and install it.
3. Hardware vendor is hiding something - it has neither kernel code, nor documentation so others can the code. This means vendor is hiding something, and it's better not to use such devices in Linux.

### Networking

There is probably nothing that cannot be done for networking in Linux. All sorts of network devices are done in Linux, such as firewalls, name servers, routers.

First command to look is `ping` - it sends special `ICMP ECHO_REQUEST` packet to specified network host. Most network hosts reply to it, but Linux hosts and other network devices can be configured to ignore these packets, for security reasons (Host discovery, DoS). It sends the packet every second by default, and prints statistics when interrupted.

`traceroute` - command to display the hops packets do when trying to reach destination host, IPs of the routers, timings. If router doesn't show any credentials (indicated by asterisks), it's because they are configured so or there is a firewall, or some other problems.

`netstat` - network interface settings and statistics. With `-ie` option we can see all network interfaces with packets sent/received, errors, IPs, MACs, whether it's up or not. It also contains loopback network inteface, which is virtual interface so machine sends packets to itself. With `-r` option we see kernel routing table. It includes destination field (target ip should match destination field, according to genmask field. Default matches all not matched IPs), gateway (next router to reach), network interface (which interface to use to send the packets to the target ip). So the full picture is: For packets matching Destination/Genmask, send them out of Iface, optionally via Gateway.

`ftp` - interactive file transfer program operating on top of File Transfer Protocol. Supported by most if not all browsers. It transfers files over the network to computer. Communication is not encrypted. FTP client/server implementation example is FileZilla. Flow happens like this: user connects to FTP server (any machine hosting ftp server), users connect to it with `ftp fileserver`, authenticate, go to some directory, and upload/download files to/from the server.

There is also `lftp`, improved version of `ftp`. It works just like `ftp`, but with additional caps like multiple protocol support (HTTP), background processes, retries, path completions, directory mirrorings (syncing entire dirs).

There is also `wget`, non-interactive program to download files from web and FTP sites. We can grab a copy of first page of some page with `wget example.com`. It has many options like resuming download, mirroring a webpage (copying all files), etc.

_Secure communication with remote hosts_

From early days Unix-like systems could be administrated remotely via network. There were many programs to connect to remote hosts, like `rlogin` or `telnet`, but as with `ftp`, it has major problem, communication was not encrypted, including usernames and passwords.

To fix that SSH (secure shell) protocol was developed. Advantages are it verifies remote host is the one who remote host claims it is, and secure communication with encryption.

SSH comes with client and server. Server listens on port 22 and accepts new connections, while client connects to this port. By default some distributions (Ubuntu) come with client only, while some (RedHat) come with both client and server.

To connect to remote host with SSH `ssh hostname` is used, for example `ssh localhost`. To specify username (different from current session's username), `ssh bob@localhost` can be used.

Single command can also be executed with `ssh bob@localhost 'ls -la'` and print in local terminal, or forward to file with `ssh bob@localhost 'ls -la' > entries.txt`

When connecting to remote host, if the host is new and client hasn't seen it yet, client makes a warning like `Authenticity of host cannot be established, continue?`, which can be continued.

SSH client might refuse to connect with message that remote identification has changed and MITM attack might be conducting. This happens because of 3 reasons: MITM attack (unlikely, because ssh errors), host has changed OS, or it reinstalled SSH server. Error also points to offending key in `~/.ssh/known_hosts` with a line number. By deleting it and trying to connect to remote host again, the error is fixed.

By default passwordless auth is enabled in SSH. Only key-based auth is enabled. To generate ssh key `ssh-keygen` command is used, which generates public key and private key. Public key should be placed inside `~/.ssh/authorized_keys` file, and login can be performed with `ssh -i ~/.ssh/key bob@localhost`.

When SSH connection is established, encrypted tunnel between client and server is established. Commands to be executed on remote host are sent via this tunnel, and results are sent back. But it can send most network traffic, including outputs of some GUI programs. So this means GUI of some program can be viewed locally with SSH. To do this `-X` option (or `-Y` option in some systems) should be used, like `ssh -X bob@localhost`, and simply executing command like `xload`.

All of these come with OpenSSH package (for example `ssh` client, `sshd` server, `ssh-keygen`). But it includes another commands:

1. `scp` - secure copy, between local and remote hosts. It works just as `cp` command, but like `scp [username@]host:directory copy_to`.
2. `sftp` - secure alternative for `ftp` program. Important note is that server doesn't need to run `ftp` server for this. Only running `ssh` server is enough for `sftp` to work just as `ftp` server.

### Searching for files

There are a lot of files in the Linux, and there are tools to easily search for them.

`locate` - find files in easiest way, by name. The name with some optional path is entered, and if path matches the input, file locations are shown, like `locate bin/zip`. Database of files are searched, and it's not always in sync with current state of filesystem. To update the db, `updatedb` command is used. It's usually run as cron job, once a day.

_find_ is more advanced command that lets us search for file or directory with tests, actions, and options.

It accepts a directory to search for, and it recursively searches for its subdirectories too. For example `find ~`.

**Tests**.

We can specify what to search for, file or directory, with `-type` test. For example: `find ~ -type f` searches for files. Possible inputs for it are `l` (symbolic link), `d` (directory), `f` (regular file), and others (block special device file and char special device file).

Other tests include:

1. Pattern to match name of file - `-name pattern`, for example `-name "*.jpg"` (note that to prevent expansion the quotes are used).
2. Size of file, `-size size`, which can accept more than or less then some unit. Units are `k` (kb), `M` (mb), `G` (gb), `c` (bytes), and others. For example `-size +1M` for files with size for than 1MB, or `-size -1M` for files less than 1MB.
3. Empty files, `-empty`.
4. And many more.

**Operators**.

Even though tests are powerful, we might need to make logical relations between the tests. For example what if we want to match files or directories with bad permissions? Operators help us create relations:

1. `-and` - match the entry if both checks are true
2. `-or` - match the entry if only any check is true
3. `-not` - match the entry if check if false
4. `()` - group the tests and operators together

When no operator is specified, `-and` is assumed. Here is solution for problem above: `find ~ \( -type f -not -perm 0600 \) -or \( -type d -not -perm 0700 \)`. We use backslash to escape special meaning of parantheses in shell. Between `-type f` and `-not -perm 600` there is implicit `-and`.

Also expressions might not be performed according to the operator, just like in scripting languages, where `expression1 && expression2` expression2 is only performed if expression1 is true. This is done for performance.

**Actions**

We can specify what to do with the results found with actions:

1. `-delete` - delete currently matching file
2. `-ls` - perform `ls -dils` on matchin file and print to stdout.
3. `-print` - print full pathname of file to stdout. Default action.
4. `-quit` - quit once match is made.

For example `find ~ -type f -ls`. Note that between `-type f` and `-ls` there is `-and` operator.

These are builtin actions, but it's possible to define custom actions too with `-exec command {} ;` syntax. `{}` is symbolic representation of current pathname, and `;` is required to indicate the end of the command. Because these are special symbols for shell, they need to be escaped by quote or backslash. For example `find ~ -type f -exec ls -la '{}' ';'`

It's also possible to make the program prompt before executing custom action if match is found by using `-ok` instead of `-exec`.

The performance of this approach might not be good, because instance of custom command provided is run each time a match is found. It would be better to make an argument list of the results, and then give it to command for single execution. There are 2 ways to do this:

1. With `find` itself, providing `+` instead of `;` and the end. This way the results are treated as a list for single command execution. For example `find ~ -type f -exec ls -la '{}' +`
2. With `xargs` command. This command constructs argument list and executes a command provided. For example `find ~ -type f | xargs ls -la`. Number of arguments that can be placed into command line is not infinite. If it exceeds the limits (can be seen with `xargs --show-limits`), `xargs` splits arguments list into full buckets and execute each one by one.

Sometimes files have spaces or even newlines in the names. Space is counted as delimeter for `xargs` command, that's why if name of file is separated by space, 2 inputs will be passed to `xargs`. To prevent it we can mark null character as a delimeter. Null character is character marked with number 0, as opposed to space, which is marked as 32. `find` command accepts `-print0` option to make separation by null character, and `xargs` accepts `--null` option to use null character as delimeter.

Here are other commands discussed:

1. `touch` - used to update modification time of the file. If file doesn't exist, it's created.
2. `stat` - shows all information the system knows about the file.

**Options**

There are also options that can be passed to `find`. They are used to control the scope of the search:

1. `--depth` - find and process directory files before directory itself. Automatically applied when `-delete` action is specified.
2. `--maxdepth levels` - specifies max levels to descend into directory tree when performing tests and actions.
3. `--mindepth levels` - specifies min levels to descend into directory tree when performing tests and actions.

and others.

### Archiving and backup

It's always been important to make system data secure by timely performing backups, and moving them from place to place, device to device.

Compression algorithms can be lossy and lossless. Following programs use lossless alogs, because no data loss is tolerated for files.

_gzip_

Is used to compress specified files. It replaces original specified file with one ending with `.gz`, with reduced size:

`gzip filename`

Many options exist, such as:

1. `-c`, `--stdout`, `--to-stdout`, write output to stdout and keep original files.
2. `-d`, `--decompress`, --`uncompress`, acts just like `ungzip`.
3. `-f`, `--force`, force compression even if compressed version of original file exists.
4. `-t`, `--test`, test integrity.
5. `-r`, `--recursive`, if one or more arguments are directories, recursively compress its files.
6. `-v`, `--verbose`, display verbose messages while copmpressing.
7. `-number`, set amount of compression. Less - fastest and less compressed. More - slower and more compressed. Default is 6. Can also be specified as `--fast` (1), and `--best` (9).
