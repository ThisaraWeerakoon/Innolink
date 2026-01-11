package com.innovest.repository;

import com.innovest.domain.InnovatorProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface InnovatorProfileRepository extends JpaRepository<InnovatorProfile, UUID> {
}
