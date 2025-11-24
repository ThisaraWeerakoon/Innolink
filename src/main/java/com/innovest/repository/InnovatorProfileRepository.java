package com.innovest.repository;

import com.innovest.domain.InnovatorProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface InnovatorProfileRepository extends JpaRepository<InnovatorProfile, UUID> {
}
