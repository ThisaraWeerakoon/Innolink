package com.innovest.service;

import com.innovest.domain.User;
import com.innovest.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public List<User> getPendingUsers() {
        return userRepository.findAll().stream()
                .filter(user -> !user.isVerified())
                .collect(Collectors.toList());
    }

    @Transactional
    public User verifyUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setVerified(true);
        return userRepository.save(user);
    }
}
