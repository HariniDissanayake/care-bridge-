package com.carebridge.backend.repository;

import com.carebridge.backend.model.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface PostRepository extends JpaRepository<Post, UUID> {
    Page<Post> findByStatus(Post.Status status, Pageable pageable);
    Page<Post> findByCategoryAndStatus(Post.Category category, Post.Status status, Pageable pageable);
}