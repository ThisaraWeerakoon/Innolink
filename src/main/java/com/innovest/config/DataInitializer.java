package com.innovest.config;

import com.innovest.domain.User;
import com.innovest.domain.UserRole;
import com.innovest.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Force reset the admin user every time the app starts
        // This ensures 'admin@innovest.com' always works with 'admin123'
        createOrUpdateAdmin("admin@innovest.com", "admin123");
        createOrUpdateAdmin("custom_admin@innolink.com", "password123");
    }

    private void createOrUpdateAdmin(String email, String password) {
        User admin = userRepository.findByEmail(email).orElse(new User());
        admin.setEmail(email);
        admin.setPasswordHash(passwordEncoder.encode(password));
        admin.setRole(UserRole.ADMIN);
        admin.setVerified(true);
        userRepository.save(admin);
        System.out.println("ADMIN ACCOUNT RESET: " + email + " / " + password);
    }
}
