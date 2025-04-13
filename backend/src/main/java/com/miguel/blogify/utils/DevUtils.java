package com.miguel.blogify.utils;

import com.miguel.blogify.domain.entity.User;
import com.miguel.blogify.repository.PostRepository;
import com.miguel.blogify.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Scanner;

@Component
//@Profile("dev")
public class DevUtils {

    private final UserRepository userRepository;
    @Autowired
    private PostRepository postRepository;

    @Autowired
    public DevUtils(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Bean
    public CommandLineRunner devToolsRunner() {
        return args -> {
            if (!"true".equals(System.getProperty("run.dev.utils"))) {
                return;
            }

            Scanner scanner = new Scanner(System.in);
            boolean exit = false;

            while (!exit) {
                System.out.println("\n=== Dev Utils Menu ===");
                System.out.println("1. List all users");
                System.out.println("2. Delete user by email");
                System.out.println("3. Delete all users");
                System.out.println("0. Exit");
                System.out.print("Choose an option: ");

                int choice = scanner.nextInt();
                scanner.nextLine();

                switch (choice) {
                    case 1:
                        listAllUsers();
                        break;
                    case 2:
                        System.out.print("Enter email to delete: ");
                        String email = scanner.nextLine();
                        deleteUserByEmail(email);
                        break;
                    case 3:
                        deleteAllUsers();
                        break;
                    case 0:
                        exit = true;
                        break;
                    default:
                        System.out.println("Invalid option. Please try again.");
                }
            }

            System.out.println("Dev Utils completed.");
            System.exit(0);
        };
    }

    private void listAllUsers() {
        List<User> users = userRepository.findAll();
        System.out.println("\n=== All Users ===");
        if (users.isEmpty()) {
            System.out.println("No users found.");
        } else {
            users.forEach(user ->
                    System.out.println("ID: " + user.getId() +
                            " | Name: " + user.getName() +
                            " | Email: " + user.getEmail()));
        }
    }

    private void deleteUserByEmail(String email) {
        userRepository.findByEmail(email).ifPresentOrElse(
                user -> {
                    userRepository.delete(user);
                    System.out.println("User with email " + email + " deleted successfully.");
                },
                () -> System.out.println("User with email " + email + " not found.")
        );
    }

    private void deleteAllUsers() {
        System.out.println("Are you sure you want to delete ALL users? (yes/no)");
        Scanner scanner = new Scanner(System.in);
        String confirmation = scanner.nextLine();

        if (confirmation.equalsIgnoreCase("yes")) {
            long count = userRepository.count();
            userRepository.deleteAll();
            System.out.println(count + " users deleted successfully.");
        } else {
            System.out.println("Operation cancelled.");
        }
    }
}