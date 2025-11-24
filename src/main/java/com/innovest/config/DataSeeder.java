package com.innovest.config;

import com.innovest.domain.User;
import com.innovest.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        updateUserPassword("sarah@agritech.com", "password123");
    }

    private void updateUserPassword(String email, String rawPassword) {
        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            String encodedPassword = passwordEncoder.encode(rawPassword);
            user.setPasswordHash(encodedPassword);
            userRepository.save(user);
            System.out.println("DataSeeder: Updated password for user: " + email);
        } else {
            System.out.println("DataSeeder: User not found: " + email);
        }
    }
}
