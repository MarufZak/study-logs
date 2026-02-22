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

Almost all commands we have dealt so far includes producing outputs or errors. When program executes, it produces some results, or some errors. Knowing that in Unix philosophy everything is a file, output of a program is put in file named _standard output_, named _stdout_. And error is put inside _standard error_, also named _stderr_. Both _stdout_ and _stderr_ are linked to the screen. There is also _stdin_, which is linked to the keyboard by default. With I/O redirection, it's possible to change this behavior.

We can redirect _stdout_ of program to some file. It's done with **>** operator. If file doesn't exist, it's created. Note that file contents are overwritten once **>** is used. To append output to the file, **>>** is used.

Redirecting stderr is a bit harder. Program produces output to file streams. First three are _stdin_, _stdout_, _stderr_. Shell them internally by file descriptiors 0, 1, 2 respectively. Shell provides notation to redirect files using file descriptor numbers. To redirect _stderr_ to some file, **2>** syntax is used. For example `ls -la nonefile 2> errors.txt`.

Sometimes it's useful to redirect both output and errors to same file. For this `ls -la somefile files.txt 2>&1` is used. In this case output of command is redirected to the file, and _stderr_ is redirected to _stdout_. Swapping the order of these redirects doesn't work, redirecting _stderr_ should be after _stdout_ redirection.

Modern bash provides another way to redirect both _stdout_ and _stderr_ to same file, for example `ls -la somefile &> files.txt`, with **&>** operator.

To ignore the output and not print on the screen, we can redirect it to `/dev/null`. It's special file in Unix systems that simply does nothing with the input. This file is called bit bucket.

The command to concatenate the files is `cat`. We can specify file names and it outputs the contents for us. But if we don't, it hangs. It waits input from _stdin_, and because it's attached to keyboard, it's waiting for us to type. We can also redirect the _stdin_ from keyboard to some file with following syntax: `cat < files.txt`, so with **<** operator.

Redirection is taken from shell feature called _pipeline_. It's about redirecting stdout to stdin with `|` character. For example `ls -la | less` redirects output to `less` command. So yes, `less` also accepts input from stdin.

We can make pipelines more complex, by adding some layers. These layers might serve as filtering layers. It can be done with `sort`, `uniq`, `grep`, and other commands. These commands are also discussed: `wc` (lines, words, bytes count), `head/tail` (tail has feature of viewing the changes in realtime with `-f` option), `tee` (read from stdin and output to stdout and files).
