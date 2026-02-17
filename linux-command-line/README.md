# Linux Command Line

My notes and takeaways from the Linux Command Line book.

![Book Cover](./assets/cover.jpg)

These days companies decide on what users can or can't do with their computers. It's taking freedom out of the users. Linux is going the opposite way, it is giving the freedom. And freedom means knowing and deciding what is exactly happening in your computer.

While GUI makes easy tasks easy, CLI makes difficult tasks possible. Because Linux is modeled after Unix, it has same CLI utilities. And because Unix was first developed long before GUI, it has very extensible list of CLI utilities.

GNU has big impact on Linux, as Linux is the name of kernel, and it cannot be the whole system on its own. GNU provided essential operating system components such as core utilities, built tools, editors, etc. That's why some refer to Linux as GNU/Linux.

## Part 1, learning the shell

Shell is a program that takes the commands we enter and give to operating system to carry out. Most Linux distributions supply `bash` shell program, which is enhanced version of `sh`, original shell program for Unix.

When using GUI, we need another interface to write commands, it's called terminal emulator. Once we start it, prompt is shown, usually prepended by username, machine name, and current directory. If it ends with `$` sign, it means we are regular user, if with `#`, it means we are root user.

Command history is remembered, usually up to 500 commands.

Basic commands like `date`, `cal`, `free`, `df`

Linux has one filesystem, while Windows uses separate file systems for each device mounted to it. Filesystem is structured as tree-like structure. Basic commands include `ls`, `pwd`, 'cd'.

Most top-level folder is root folder, and can be accessed with `cd /`. Each user has own directory, called home directory, can be accessed with `cd`.

- Linux has no concept of file extension, and content type is determined other way. It uses magic numbers (special bytes patterns at the start of the file, there is `file` command for this too). Though some applications might use its extension to determine the contents.
- In Linux the files are case-sensitive.
- Although many characters are allowed, use dash, dot, or \_ to make a space in filenames, instead of using spaces or other characters. Using spaces makes navigation commands much more harder.

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

Most used commands in linux are: `mkdir`, `mv`, `cp`, `rm`, `ln`. While most actions done with these commands can be done with GUI, these commands make it easy to perform tasks that are complex on GUI, for example copy all .html files.

Because filenames are used so much in shell, shell has a feature of listing filenames in convenient way, glob patterns (wildcards).

1. `*` - any character
2. `?` - any single character
3. `[characters]` - any character in set of _characters_
4. `![characters]` - any character not in set of _characters_
5. `[[:class:]]` - any character that is member of specified class. These classes include `[[:lower:]]`, `[[:upper:]]`, `[[:alpha:]]`, `[[:alnum:]]`, `[[:digit:]]`.

`[a-z]` and `[A-Z]` used to work in older version of Linux, they do now too, but they don't produce expected results unless configured properly.
