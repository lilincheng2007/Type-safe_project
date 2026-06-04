package delivery.review.utils

import java.nio.file.{Files, Path, Paths}

object ReviewImageUploads:
  private val dirName = "review-uploads"

  def directory: Path =
    val p = Paths.get(dirName).toAbsolutePath.normalize
    Files.createDirectories(p)
    p
