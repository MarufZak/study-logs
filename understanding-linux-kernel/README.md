# Understanding Linux Kernel

![Understanding Linux kernel book cover](./assets/book-cover.png)

My notes and takeaways from Understanding Linux Kernel book by Daniel P. Bovet and Marco Cesati. The notes don't deep dive into the details of the book but rather focus on the key concepts and ideas.

## Table of Contents

- [Introduction](#introduction)
- [Basic OS concepts](#basic-os-concepts)
- [Overview of filesystem](#overview-of-filesystem)
  - [Hard and soft links](#hard-and-soft-links)
- [Overview of Unix kernels](#an-overview-of-unix-kernels)
- [Interrupts](#interrupts)

## Introduction

Linux is a member of large family of Unix-like operating systems. Became popular in 1990s, initially developed by Linus Torvalds in 1991 as OS for IBM-compatible personal computers. Over the years Linux is being developed by many developers, and Linux is now available for many archs, for example AMD64, Intel’s Itanium and others.

Linux kernel is true Unix Kernel, but not full Unix OS, because it doesn’t include Unix applications, such as file system utils, system admin commands, compilers, text editors and others. But they can be freely downloaded.

Source code for Linux kernel is contained in more than 14.000 C and Assembly files, having over 6 millions lines of code and taking over 230 MB of disk space.

Linux kernel has similarities on architecture compared to other Unix-like kernels, because they share fundamental design ideas and features.

Linux kernel is compliant with IEEE POSIX standard, making it possible for other Unix programs to be compiled and executed on Linux with little or no efforts.

Unix-like kernels similarities:

1. Monolithic kernel, exceptions is Apple Mac OS X, which follow microkernel approach.
2. Compiled and statically linked kernel. Ability to dynamically load and unload device drivers (modules). Solaris and few others have this feature.
3. Kernel threading. Organized as a set of kernel threads, where kernel operates, and context switches between kernel threads are less expensive rather than in processes, because they operate in common address space.
4. Multithreaded application support, where application has many lightweight processes (LWP), which can operate on common address space and so on. Linux handles them via `clone()` `syscall`.
5. Preemptive kernel. This means that even if a task is running, the kernel can switch to a more urgent task if needed.
6. Multiprocessor support - the system can use more than one CPU or core to perform tasks simultaneously. Linux makes optimal use of SMP. **Symmetric multiprocessing (SMP)** means that all CPUs or cores share the same memory and can run tasks equally, making the system more efficient and balanced.
7. Filesystem. In Linux, filesystems come in many flavors, and we can switch between them, and its easier than than in other kernels.
8. Streams I/O, subsystem used for writing device drivers, network protocols and others. Linux has no analog for it.

Linux is cost-free, has all components customizable, meaning we can choose which features not to use. Runs on low-end, inexpensive hardware. Efficient and powerful, because it utilizes all hardware components at max level. Have low failure rate and system **maintenance**. It’s possible to fit kernel image with few system programs in 1.44 MB floppy disk (only linux is known to do this). Highly compatible with other OSs. Linux lets you mount filesystems to other OSs’ filesystems, linux can operate with network layers like ethernet, fiber, bluetooth and others. With corresponding libs, it can execute some apps written for other OSs on 80x86 platform. And finally, Linux is well supported.

## Basic OS concepts

Each computer includes a basic set of programs called the _operating system._ And the most important program among them is kernel. It’s loaded into RAM when system boots and contain many critical procedures needed for system to operate. The operating system fulfills two main objectives:

1. Interact with the hardware components to service all low-level programmable elements included in the hardware.
2. Provide execution environment for the user programs.

Unix-like OSs hide the hardware details from the user, but those can be received by requesting it from the kernel, which operates with hardware device. Hardware has 2 execution modes for CPU, and Unix calls these as User mode (non-privileged) and Kernel mode (privileged).

**Multiuser systems -** computer that can execute several apps belonging to two users concurrently and independently. Such computer includes several features: auth mechanism for verifying user identity, a protection mechanism against buggy or malicious user programs that could block other apps or spy on activity of other users, an accounting mechanism to limit the amount of resource units assigned to each user. For such tasks OS uses privileged CPU mode, and doesn’t use protections if the requesting user is privileged.

**_Process -_** an instance of program execution. It has set of memory cells with which process can operate. Systems that allow concurrent processings are called **_multiprocessing._** Processes are called **_preemptable_** (OS can stop - preempt) when OS activates scheduler periodically based on how long the process holds the CPU.

**_Scheduler -_** component that chooses which process should progress. In multiuser computers scheduler is invoked periodically.

**_process/kernel model -_** each process thinks it’s only process on the machine and has exclusive access to OS services. When doing `syscall`, the process executes code in kernel mode and then returns back to user mode.

**_kernel architecture._** Unix kernels are monolithic, meaning entire operating system with core services run in single process and in single address space in kernel mode. In comparison, microkernel OSs have their services separate memory management and such services in one process running in kernel mode, and other services like device drivers or file systems into another running in user mode. This approach improves modularity and fault isolation, but can lead to performance overhead due to frequent communication between kernel and user space.
Microkernel approach use RAM better, because it loads only the essentials parts (modules) of what’s needed into the RAM, whereas monolithic approach keeps the RAM unnecessary big.

To achieve what microkernels offer, Linux introduced concept of modules, which are files that can be linked and unlinked at runtime. Kernel modules are loadable pieces of code (like device drivers or file systems) that can be dynamically added or removed at runtime, allowing the kernel to load only necessary components

## Overview of filesystem

In Unix, the file is a container structured as a sequence of bytes. It can be binary file, or simple file (both are referred as regular file). Maximum characters for name is 255. The filesystem is organized as an inversed tree data structure, where the topmost node is root node.

### Hard and soft links

The filename included in a directory is called a hard link, or just a link. The same filename can have several links, but all of them point to a single file. All hard links have their own `INode`, with all metadata such as user permissions (but not filename) inside. We can create hard links with command `ln p1 p2`. But hard links have some disadvantages: it’s impossible to create hard links for directories, and we can only create hard links among files included in the same filesystem (this might be trivial because in Unix several filesystems might be included, without the user knowing it). To solve this, soft links were introduced.

Soft link is a short file that contain an arbitrary pathname of another file. Pathname may refer to any file, even to nonexistent one. To create soft link, we use `ln -s p1 p2`. When it’s executed, directory path of `p1` is taken, put into the contents of the `p2` with its name. Soft links have their `INode`, with metadata about the link itself.

**INode** is a data structure that contains all information for filesystem to handle a file, which includes (according to POSIX): file type, number of hard links associated with this file, file length in bytes, device id, INode number as id of file in filesystem, UID of file owner, user group ID, file change, last access and other timestamps, and access rights (owner, group, others).

File handling. Process in User Mode cannot directly interact with hardware devices (memory in this case), so we need `syscalls` to interact with it (which operate in kernel mode). For example, `open` syscall is used to open a file. It returns a file descriptor (unique ID of open resouce that’s managed by OS to track and manage opened files), and creates file object, that contains set of flags, how file is opened, file poiner (current position in file where read/write happens) and etc. The contents of file can be accessed sequentially or randomly.

Files are deleted when the links count in the `INode` reaches 0.

In short, soft links are references, while hard links are alternative access points to the same data.

## An overview of Unix kernels

Unix kernel provides environment for processes to execute, and it does that by providing corresponding interfaces, which are used by applications, and therefore applications don’t use hardware directly.

The kernel itself is not a process, but process manager. Besides user processes, Unix systems include privileged processes, called **kernel threads.** They run in kernel address space, do not interact with users, usually created during startup and terminated when shutting down.

When kernel stops execution of a process, it saves the info about it in **process descriptor,** including program counter (PC), stack pointer (SP), and other registers. It can then continue executing this process with info in process descriptor.

**Reentrant kernels** means several processes may be executing in kernel mode at the same time. Ways to provide reentrance are to use reentrant functions (which modify only local variables, not global), or using locking mechanisms to ensure that only one process can execute a non-reentrant function at a time.

**kernel control path** is sequence of instructions kernel executes to handle syscall, exception, or interrupt. When running, they can be interleaved by CPU, when CPU detects an exception, a hardware interrupt occurs (which may happen at any time), or when syscall request (for ex getting data from memory) that cannot be handled immediately, another process is created with process scheduler, and the first kernel control path is left unfinished.

Each process runs in its own address space with private stack, data, and code areas, and this process running in kernel mode uses kernel set of these. Sometimes the memory (not data) may be shared among processes, requested by other processes, or done by kernel.

Synchronization problems occur when two or more processes try to access the same data structure at the same time. Solutions are:

1. Interrupt disabling, not good solution, because it freezes all hardware interrupts.
2. Disable kernel preempting before entering critical region and enabling after leaving it, meaning another process cannot be switched to while some piece of code is executing. Good for uniprocessors, but not for multiprocessors, because disabling happens locally in one processor, not the whole system.
3. Semaphore. Each data structure has a semaphore, containing of integer variable (open or closed), a list of waiting processes, and atomic methods `down` and `up`. This is good solution, but sometimes it may fail, because of the pushing to the list of awaited processes and suspending it. While these operations happen, other kernel control path may already released the semaphore.
4. Spin locks. Same as semaphores, but without awaiting processes list. Instead all processes continuously iterate and try to access resource inside the loop. It is bad approach for uniprocessors, because there is one CPU

**signals** are a way to notify the processes about system events. Processes can signal, or ignore. If ignored, default handlers for that signal is invoked, which might be terminate process, suspend it, ignore it, and others.

There are 2 types of system events: asynchronous notifications - invoked by user (for example SIGINT), and synchronous notifications - triggered by kernel (for example SIGSEGV, which means invalid memory address access).

Process becomes **zombie** if it finishes running and its parent doesn’t acknowledge it, and if parent is terminated without acknowledging it, it becomes child process of init process, which acknowledges all its children.

A **process group** is collection of processes with a leader (has same pid as process, which created a group), which allows shell to manage them as a single unit (job).

A **login session** is high level group of processes, which is created when user logs in (with ssh for example). Many groups can be children of this group that are started from the same terminal. When user logs out, all children processes terminate.

## Interrupts

Interrupt is signal to divert the processor to code outside normal flow. The difference between interrupt and context switch is that interrupt doesn’t operate in separate process, it’s kernel control path that runs in expense of the same process that was running when kernel was interrupted. The interrupt handler is lighter than process.

All interrupt requests (IRQs) issued from I/O device controllers give rise to maskable interrupts. In comparison, all non maskable interrupts are issued by critical events as hardware component failures and always recognized by CPU.

There are 2 types of interrupts:

1. **Synchronous** - \***_synchronized with execution of instruction, caused by execution of instruction that cannot be properly handled. For example, divide by 0. Such interrupts are internally generated and called _**exceptions.\*\*\*
2. **Asynchronous** - not synchronized with execution of instructions, and can occur at any time. Triggered by external devices, such as I/O hardware. Such interrupts are called regular **interrupts.**

Each interrupt is associated with number ranging from 0 to 255. It’s called **vector.**

Every I/O controller is connected to the **PIC** (programmable interrupt controller). It’s middleware between controllers and CPU to manage the priority of interrupts, so the one with most priority reaches the CPU. PIC (specifically Intel 8259) supports up to eight I/O devices. To extend it, we can connect the output of one PIC to the next PIC _as input._ This is called **cascading**.

Each IRQ line can be disabled, and when enabled again, _stored_ signals are sent to the CPU.

PIC job cycle is as following:

1. Monitor IRQ (interrupt request) lines for raised signals. If one or more signals are raised, select one with lower pin number.
2. If a raised signal occurs in IRQ line, converts the signal into a corresponding vector, then stores this vector in interrupt controller i/o port, so CPU can read it via data bus. Send a raised signal to processor INTR pin (issue an interrupt). Then it waits until CPU acknowledges the interrupt signal by writing into one of PIC I/O ports.
3. When acknowledgement occurs, it clears the INTR line and goes back to step 1.

When CPU accepts interrupt, it acknowledges the PIC to get interrupt vector. When it receives it, it looks up the **IDT** for corresponding handler.

**IDT** - interrupt descriptor table, located in IDT register (meaning starting address is located in IDT register), firstly initialized by BIOS routines when computer still operates in Real Mode, but then reinitialized again and moved to the RAM. It consists of interrupt vector and address of its corresponding handler.

**INTR** - a line that is connected to CPU. It receives maskable interrupt, meaning it can be ignored by CPU. After every instruction, CPU checks for **IF** (interrupt flag), if it’s set to 1, it checks for the pending interrupt requests, if there is one, it executes its handler in kernel mode.

**NMI** - a line that is connected to CPU, which is used for interrupts that cannot be ignored by CPU. For example, if temperature of CPU is more that threshold, CPU is interrupted with this line to lower its temperature. Other examples include hardware failures and memory errors.

![PIC connection example](./assets/pic.png)

This approach of connecting single output of PIC to the INTR line is used for uniprocessor systems. The approach for multiprocessor systems is different.

## Exceptions

The 80x86 microprocessors issue ~20 exceptions, and kernel must provide handler for each. Such exceptions include divide by zero (fault), debug (trap or fault), overflow (trap), bound check (fault) and others. Exceptions are classified into two:

1. **Processor-detected exceptions** - raised when CPU detects anomalous condition while executing instruction. This is classified into 3 groups: **fault, trap, abort**.
2. **Programmed exceptions** - occur at the request of programmer. For example `bound` instruction also rise such exception when condition (in this case address is outside the bound) is not true. Such exceptions are also called software interrupts, and is used for `syscall` or to notify debugger about specific event.

**Faults -** exception, which can be corrected, and once corrected (when exception handler terminates), the instruction can be resumed (re-executed).

**Traps -** same as fault, but doesn’t require re-execution. Used for debugging purposes.

**Aborts -** raises when a serious and not coverable error is occurred such as hardware failures. The process terminates when exception handler is executed.

## APIC

For multiprocessor systems, I/O APIC (advanced PIC) is used. To support previous versions, motherboard includes both PIC and APIC. Moreover, each core includes local APIC. All local I/O APICs are connected to external APICs.

The main I/O APIC (not inside any core) consists of a set with 24 IRQ lines, a 24 entry **Interrupt Redirection Table (IRT),** each entry can be programmed to indicate interrupt vector priority, destination processor. This is used to redirect the IRQ to one or more local APIC units visa APIC bus.

Distribution of signals can happen in two ways:

1. **Static distribution -** The IRQ signal is delivered to the local APICs as listed in the corresponding entry of the Interrupt Redirection Table. The interrupt can be sent to a specific CPU, a subset of CPUs, or all CPUs simultaneously (broadcast mode).
2. **Dynamic distribution -** The IRQ signal is delivered to the local APIC of the processor running the process with the lowest priority. Each local APIC has **programmable task priority register (TPR),** it’s used to calculate priority of process that is currently running. This register is modified with each process switch. If two or more local APIC have same priority, **arbitration** (each CPU has arbitration priority register from 0 - 15) is used.

One CPU can also send an interrupt to another CPU, this is called **interprocess interrupts**.

![Example of APIC usage](./assets/apic.png)
