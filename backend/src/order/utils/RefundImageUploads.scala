package delivery.order.utils

import java.nio.file.{Files, Path, Paths}

object RefundImageUploads:
  private val dirName = "refund-uploads"

  def directory: Path =
    val p = Paths.get(dirName).toAbsolutePath.normalize
    Files.createDirectories(p)
    p
