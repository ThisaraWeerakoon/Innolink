package com.innovest.service;

import com.innovest.domain.User;
import com.innovest.dto.LoginRequest;
import com.innovest.dto.RegisterRequest;
import com.innovest.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {



    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;



    @Transactional
    public User login(LoginRequest loginRequest) {
        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid credentials");
        }

        return user;
    }

    @Transactional
    public User register(RegisterRequest registerRequest) {
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new RuntimeException("Email already in use");
        }

        User user = new User();
        user.setEmail(registerRequest.getEmail());
        user.setPasswordHash(passwordEncoder.encode(registerRequest.getPassword()));
        user.setRole(registerRequest.getRole());
        user.setVerified(false); // Default to false

        return userRepository.save(user);
    }
}
