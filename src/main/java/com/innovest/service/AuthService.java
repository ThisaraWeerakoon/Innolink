package com.innovest.service;

import com.innovest.domain.User;
import com.innovest.dto.AuthResponse;
import com.innovest.dto.LoginRequest;
import com.innovest.dto.RegisterRequest;
import com.innovest.repository.UserRepository;
import com.innovest.security.CustomUserDetails;
import com.innovest.security.JwtUtils;
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

    @Autowired
    private JwtUtils jwtUtils;

    @Transactional
    public AuthResponse login(LoginRequest loginRequest) {
        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid credentials");
        }

        String token = jwtUtils.generateToken(new CustomUserDetails(user));
        return new AuthResponse(
                token,
                user.getId(),
                user.getEmail(),
                user.getRole().name());
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